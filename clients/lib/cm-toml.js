var CodeMirror = require('code-mirror');
module.exports = CodeMirror;

CodeMirror.defineMode("toml", function () {
  var symbol_regex1 = /^(?:~|!|%|\^|\*|\+|=|\\|:|;|,|\/|\?|&|<|>|\|)/;
  var open_paren_regex = /^(\(|\[)/;
  var close_paren_regex = /^(\)|\])/;
  var keyword_regex1 = /^(if|else|return|var|function|include|doctype|each)/;
  var keyword_regex2 = /^(#|{|}|\.)/;
  var keyword_regex3 = /^(in)/;
  var html_regex1 = /^(html|head|title|meta|link|script|body|br|div|input|span|a|img)/;
  var html_regex2 = /^(h1|h2|h3|h4|h5|p|strong|em)/;
  return {
    startState: function () {
      return {
        inString: false,
        stringType: "",
        lhs: true,
        inArray: 0
      };
    },
    token: function (stream, state) {
      //check for state changes
      if (!state.inString && ((stream.peek() == '"') || (stream.peek() == "'"))) {
        state.stringType = stream.peek();
        stream.next(); // Skip quote
        state.inString = true; // Update state
      }
      if (stream.sol() && state.inArray === 0) {
        state.lhs = true;
      }
      //return state
      if (state.inString) {
        while (state.inString && !stream.eol()) {
          if (stream.peek() === state.stringType) {
            stream.next(); // Skip quote
            state.inString = false; // Clear flag
          } else if (stream.peek() === '\\') {
            stream.next();
            stream.next();
          } else {
            stream.match(/^.[^\\\"\']*/);
          }
        }
        return state.lhs ? "property string" : "string"; // Token style
      } else if (state.inArray && stream.peek() === ']') {
        stream.next();
        state.inArray--;
        return 'bracket';
      } else if (state.lhs && stream.peek() === '[' && stream.skipTo(']')) {
        stream.next();//skip closing ]
        return "atom";
      } else if (stream.peek() === "#") {
        stream.skipToEnd();
        return "comment";
      } else if (stream.eatSpace()) {
        return null;
      } else if (state.lhs && stream.eatWhile(function (c) { return c != '=' && c != ' '})) {
        return "property";
      } else if (state.lhs && stream.peek() === "=") {
        stream.next();
        state.lhs = false;
        return null;
      } else if (!state.lhs && stream.match(/^\d\d\d\d[\d\-\:\.T]*Z/)) {
        return 'atom'; //date
      } else if (!state.lhs && (stream.match('true') || stream.match('false'))) {
        return 'atom';
      } else if (!state.lhs && stream.peek() === '[') {
        state.inArray++;
        stream.next();
        return 'bracket';
      } else if (!state.lhs && stream.match(/^\-?\d+(?:\.\d+)?/)) {
        return 'number';
      } else if (!stream.eatSpace()) {
        stream.next();
      }
      return null;
    }
  };
});

CodeMirror.defineMIME('text/x-toml', 'toml');
