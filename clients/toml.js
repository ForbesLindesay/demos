var toml = require('toml')
var DepthExplorer = require('./lib/depth-explorer.js')
var CodeMirror = require('./lib/cm-toml.js')

var input = new CodeMirror(document.getElementById('input'), {
  mode: 'toml',
  viewportMargin: Infinity,
  theme: 'solarized light editable',
  value: document.getElementById('input-content').innerHTML
})

var output = document.getElementById('output')

function update() {
  var s;
  try {
    s = toml.parse(input.getValue())
  } catch (ex) {
    return outputHTML(escape(ex.stack || ex.message || ex))
  }
  outputObject(s)
}

function escape(text) {
  if (!text) return ''
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function outputHTML(text) {
  output.innerHTML = '<pre class="cm-s-solarized">' + text + '</pre>'
}

function outputObject(res) {
  output.innerHTML = ''
  var oe = new DepthExplorer(res, 2)
  oe.appendTo(output)
}


input.on('change', update)
update()