var $ = document.getElementById.bind(document)
var regexp = require('regexp')
var DepthExplorer = require('./lib/depth-explorer')

var input = $('input')
var output = $('output')

input.addEventListener('input', update, false)
input.addEventListener('keyup', update, false)
input.addEventListener('blur', update, false)

function update() {
  var s;
  try {
    s = regexp(input.value)
  } catch (ex) {
    return outputHTML(escape(ex.stack || ex.message || ex))
  }
  outputAST(s)
}

function escape(text) {
  if (!text) return ''
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function outputHTML(text) {
  output.innerHTML = '<pre class="cm-s-solarized">' + text + '</pre>'
}

function outputAST(ast) {
  output.innerHTML = ''
  var oe = new DepthExplorer(ast, 2)
  oe.appendTo(output)
}

update()