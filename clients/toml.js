var toml = require('toml')
var ObjectExplorer = require('object-explorer')
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

var state = null
function outputObject(res) {
  output.innerHTML = ''
  var oe = new ObjectExplorer(res, state)
  if (state === null) {
    oe.isExpanded = function (path) {
      if (path.length < 2) return true
    }
  }
  oe.appendTo(output)
  state = oe.state
}


input.on('change', update)
update()