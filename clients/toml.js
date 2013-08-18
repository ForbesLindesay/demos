var CodeMirror = require('code-mirror')
var toml = require('toml')
var ObjectExplorer = require('object-explorer')

var input = new CodeMirror(document.getElementById('input'), {
  mode: 'text',
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
  var oe = new ObjectExplorer(res)
  oe.appendTo(output)
}



input.on('change', update)
update()