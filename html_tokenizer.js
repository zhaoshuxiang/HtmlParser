/**
 * 通过 *状态机* 的转换来识别出 Token
 * 根据 WHATWG 定义的HTML语法中给出的状态（State）
 * https://html.spec.whatwg.org/multipage/syntax.html#tokenization
 *
 * 输出的tokens：DOCTYPE、开始标签、结束标签、注释、字符、文件结束符
 *
 * 如果一个token被提交，它会立即被tree comstruction阶段处理。tree construction stage
 * 阶段会影响tokenization阶段，会向输入流中增加字符串
 *
 */

var token;
var attrToken;

// 解析字符串
function parse(s) {
    var i = 0,
        c, state = DataState;

    while (true) {
        c = s.charAt(i);
        if ('' === c) break;

        if (undefined !== state) state = state(c);
        i = i + 1;
    }
}

function StartTagToken() {
    this.tagName = '';
    this.attrs = [];
    this.selfCloseFlag = false;
}

function EndTagToken() {}

function AttributeToken() {}

function emitToken(t) {
    console.log(t);
}

function error() {
    console.error('error');
}

// 12.2.4.1 <初始状态>
var DataState = function(c) {
    switch (c) {
        case '&':
            return CharacterReferenceInDataState;

        case '<':
            return TagOpenState;

        case '':
            error();

        case 'EOF':
            emitToken('EOF');
            break;

        default:
            emitToken(c);
            return DataState;
    }
};

// 12.2.4.2 <初始状态的字符引用>
var CharacterReferenceInDataState = function() {
    switch (c) {
        case '':
            break;
    }
};

var PLAINTEXTState = function() {

};

// 12.2.4.8
var TagOpenState = function(c) {
    if ('!' === c) {

    } else if ('/' === c) {
        return EndTagOpenState;
    } else if (/[A-Z]/.test(c)) {
        token = new StartTagToken();
        token.tagName = c.toLocaleLowerCase();
        return TagNameState;
    } else if (/[a-z]/.test(c)) {
        token = new StartTagToken();
        token.tagName = c;
        return TagNameState;
    } else {

    }
};

// 12.2.4.9
var EndTagOpenState = function(c) {
    if (/[A-Z]/.test(c)) {
        token = new EndTagToken();
        token.tagName = c.toLocaleLowerCase();
        return TagNameState;
    } else if (/[a-z]/.test(c)) {
        token = new EndTagToken();
        token.tagName = c;
        return TagNameState;
    } else if ('\u003e' !== c) {
        error();
        return DataState;
    } else if ('EOF' === c) {
        error();
    } else {
        error();
    }
};

// 12.2.4.10
var TagNameState = function(c) {
    // 空格、tab、LF、FF
    if (isWhiteSpace(c)) {
        return BeforeAttributeNameState;
    } else if ('/' === c) {
        return SelfClosingStartTagState;
    } else if ('>' === c) {
        emitToken(token);
        return DataState;
    } else if (/[A-Z]/.test(c)) {
        token.tagName = token.tagName + c.toLocaleLowerCase();
        return TagNameState;
    } else if ('' === c) {
        error();
    } else if ('EOF' === c) {
        return DataState;
    } else {
        token.tagName = token.tagName + c;
        return TagNameState;
    }
};

// 12.2.4.34
var BeforeAttributeNameState = function(c) {
    if (isWhiteSpace(c)) {
        return BeforeAttributeNameState;
    } else if ('/' === c) {
        return SelfClosingStartTagState;
    } else if ('\u003e' === c) {
        emitToken(token);
        return DataState;
    } else if (/[A-Z]/.test(c)) {
        var attr = new AttributeToken();
        attr.attrName = c.toLocaleLowerCase();
        attr.attrVal = '';
        token.attrs.push(attr);

        return AttributeNameState;
    } else if (isNull(c)) {
        error();
    } else if (/["|'|<|=]/.test(c)) {
        error();
    } else if (isEOF(c)) {
        error();
    } else {
        var attr = new AttributeToken();
        attr.attrName = c;
        attr.attrVal = '';
        token.attrs.push(attr);

        return AttributeNameState;
    }
};

// 12.2.4.35
var AttributeNameState = function(c) {
    var attrs, attr;

    if (isWhiteSpace(c)) {
        return AfterAttributeNameState;
    } else if ('/' === c) {
        return SelfClosingStartTagState;
    } else if ('=' === c) {
        return BeforeAttributeValueState;
    } else if ('>' === c) {
        emitToken(token);
        return DataState;
    } else if (/[A-Z]/.test(c)) {
        attrs = token.attrs;
        attr = attrs[attrs.length - 1];
        attr.attrName = attr.attrName + c.toLocaleLowerCase();
        return AttributeNameState;
    } else if ('' === c) {
        error();
    } else if (/("|'|<)/.test(c)) {
        error();
    } else if ('EOF' === c) {
        error();
    } else {
        attrs = token.attrs;
        attr = attrs[attrs.length - 1];
        attr.attrName = attr.attrName + c;
        return AttributeNameState;
    }
};

// 12.2.4.36
var AfterAttributeNameState = function(c) {
    if (isWhiteSpace(c)) {
        return AfterAttributeNameState;
    } else if ('/' === c) {
        return SelfClosingStartTagState;
    } else if ('=' === c) {
        return DataState;
    } else if ('>' === c) {
        emitToken(token);
        return DataState;
    } else if (/[A-Z]/.test(c)) {
        token = new AttributeToken();
        token.attrName = c.toLocaleLowerCase();
        token.attrVal = '';
        return AttributeNameState;
    } else if ('' === c) {
        error();
    } else if (/("|'|<)/.test(c)) {
        error();
    } else if ('EOF' === c) {
        error();
        return DataState;
    } else {
        token = new AttributeToken();
        token.attrName = c;
        token.attrVal = '';
        return AttributeNameState;
    }
};

// 12.2.4.37
var BeforeAttributeValueState = function(c) {
    if (isWhiteSpace(c)) {
        return BeforeAttributeValueState;
    } else if ('"' === c) {
        return AttributeValue_DoubleQuoted_State;
    } else if ('&' === c) {
        return AttributeValue_Unquoted_State;
    } else if ('\'' === c) {
        return AttributeValue_SingleQuoted_State;
    } else if ('' === c) {
        error();
        return AttributeValue_Unquoted_State;
    } else if ('>' === c) {
        error();
        emitToken(token);
        return DataState;
    } else if (/<|=|`/.test(c)) {
        error();
    } else if ('EOF' === c) {
        error();
        return DataState;
    } else {
        token.attrVal = token.attrVal + c;
        return AttributeValue_Unquoted_State;
    }
};

// 12.2.4.38 属性值 双引号后 值的开始
var AttributeValue_DoubleQuoted_State = function(c) {
    var attrs, attr;

    if ('"' === c) {
        return AfterAttributeValue_Quoted_State;
    } else if ('&' === c) {
        return CharacterReferenceInAttributeValueState;
    } else if ('' === c) {
        error();
    } else if ('EOF' === c) {
        error();
        return DataState;
    } else {
        attrs = token.attrs;
        attr = attrs[attrs.length - 1];
        attr.attrVal = attr.attrVal + c;
        return AttributeValue_DoubleQuoted_State;
    }
};

// 12.2.4.39
var AttributeValue_SingleQuoted_State = function(c) {
    var attrs, attr;

    if ('\'' === c) {
        return AfterAttributeValue_Quoted_State;
    } else if ('&' === c) {
        return CharacterReferenceInAttributeValueState;
    } else if ('' === c) {
        error();
    } else if ('EOF' === c) {
        error();
        return DataState;
    } else {
        attrs = token.attrs;
        attr = attrs[attrs.length - 1];
        attr.attrVal = attr.attrVal + c;
        return AttributeValue_SingleQuoted_State;
    }
};

// 12.2.4.40
var AttributeValue_Unquoted_State = function (c) {
    if (isWhiteSpace(c)) {
        return BeforeAttributeNameState;
    } else if ('&' === c) {
        return CharacterReferenceInAttributeValueState;
    } else if ('>' ===c) {
        emitToken(token);
        return DataState;
    } else if (isNull(c)) {
        error();
    } else if (/"|'|<|=|`/.test(c)) {
        error();
    } else if (isEOF(c)) {
        error;
        return DataState;
    } else {
        token.attrVal = token.attrVal + c;
        return AttributeValue_Unquoted_State;
    }
};

// 12.2.4.41
var CharacterReferenceInAttributeValueState = function(c) {

};

// 12.2.4.42
var AfterAttributeValue_Quoted_State = function(c) {
    if (isWhiteSpace(c)) {
        return BeforeAttributeNameState;
    } else if('/' === c) {
        return SelfClosingStartTagState;
    } else if ('>' === c) {
        emitToken(token);
        return DataState;
    } else if (isEOF(c)) {
        error();
    } else {
        error;
        return BeforeAttributeNameState;
    }
};

// 12.2.4.43
var SelfClosingStartTagState = function(c) {
    if ('>' === c) {
        emitToken(token);
        token.selfCloseFlag = true;
        return DataState;
    } else if ('EOF' === c) {
        error();
        return DataState;
    } else {
        error();
        return BeforeAttributeNameState;
    }
};

function isNull(c) {
    return '' === c;
}

function isUpperCase(c) {
    return /[A-Z]/.test(c);
}

function isLowerCase(c) {
    return /[a-z]/.test(c);
}

function isEOF(c) {
    return 'EOF' === c
}

function isWhiteSpace(c) {
    return '\u0009' === c || '\u000A' === c || '\u000C' === c || '\u0020' === c;
}

var exports = {};
exports.parse = parse;