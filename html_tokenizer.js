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
var HTMLTokenizer = (function(argument) {
    var exports = {};

    var SOURCE_CODE = '';

    // 12.2.4.1 <初始状态>
    var DataState = function(c) {
        switch (c) {
            case '&':
                return CharacterReferenceInDataState;
                break;

            case '<':
                return TagOpenState;
                break;

            default:
                if ('  ' === c) {

                } else {

                }
        }
    };

    // 12.2.4.2 <初始状态的字符引用>
    var CharacterReferenceInDataState = function() {
        switch (c) {
            case: break;
        }
    };

    // 12.2.4.3
    var aaa = function() {

    };

    var PLAINTEXTState = function() {

    };

    // 12.2.4.8
    var TagOpenState = function(c) {
        if ('!' === c) {

        } else if ('/' === c) {
            return EndTagOpenState;
        } else if (/[A-Z]/.test(c)) {
            return TagNameState;
        } else if (/[a-z]/.test(c)) {
            return TagNameState;
        } else {

        }

    };

    // 12.2.4.9
    var EndTagOpenState = function() {

    };

    // 12.2.4.10
    var TagNameState = function(c) {
        // 空格、tab、LF、FF
        if ('\u0020' === c || '\u0009' === c || '\u000A' === c || '\u000C' === c) {
            return BeforeAttributeNameState;
        } else if ('/' === c) {
            return SelfClosingStartTagState;
        } else if ('>' === c) {
            // Emit the current tag token.
            return DataState;
        } else if (/[A-Z]/.test(c)) {
            return TagNameState;
        } else if (false) {

        } else if (false) {

        } else {

        }
    };

    // 12.2.4.35
    var AttributeNameState = function() {

    };

    // 12.2.4.36
    var AfterAttributeNameState = function() {

    };

    // 12.2.4.37
    var BeforeAttributeNameState = function() {

    };

    // 12.2.4.43
    var SelfClosingStartTagState = function() {

    };



    return exports;
})();