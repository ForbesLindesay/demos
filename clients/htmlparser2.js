'use strict'

var CodeMirror = require('code-mirror/mode/htmlmixed');
var htmlparser = require('htmlparser2');
var rfile = require('rfile');
var sample = rfile('./example.html');
var ObjectExplorer = require('object-explorer')

var input = new CodeMirror(document.getElementById('input'), {
  mode: 'htmlmixed',
  viewportMargin: Infinity,
  theme: 'solarized light editable',
  value: sample
});
var output = document.getElementById('output')

input.on('change', update);
var state = null
function update() {
  var s;
  try {
    s = (parse(input.getValue()));
  } catch (ex) {
    output.innerHTML = '<pre class="cm-s-solarized">' +
      (ex.stack || ex.message || ex).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return;
  }
  output.innerHTML = '';
  var explorer = new ObjectExplorer(s, state)
  explorer.appendTo(output);
  state = explorer.state
}

function parse(html) {
  var handler = new htmlparser.DomHandler();
  var parser = new htmlparser.Parser(handler);
  parser.parseComplete(html);
  return handler.dom;
}

update();