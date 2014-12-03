

var ht = require('./html_tokenizer.js');
require('./html_treeconstructor.js');

var str = '<html>\
    <body>\
    </body>\
</html>\
';

ht.parse(str)