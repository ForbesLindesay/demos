var CodeMirror = require('code-mirror/mode/javascript')
var compile = require('yieldify')

var input = new CodeMirror(document.getElementById('input'), {
  mode: 'javascript',
  viewportMargin: Infinity,
  theme: 'solarized light editable',
  value: 'var numbs = [1, 2, 3, 4, 5, 6]\nvar squares = nums.map(v => v * v)'
})

var output = new CodeMirror(document.getElementById('output'), {
  mode: 'javascript',
  viewportMargin: Infinity,
  readonly: true,
  theme: 'solarized light readonly'
})

function update() {
  var s;
  try {
    s = compile('input.js', input.getValue()).toString()
  } catch (ex) {
    output.setOption('mode', 'text')
    output.setValue(ex.stack || ex.message || ex)
    return
  }
  output.setOption('mode', 'javascript')
  output.setValue(s)
}

input.on('change', update)
update()