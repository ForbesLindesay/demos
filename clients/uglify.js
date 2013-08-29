var CodeMirror = require('code-mirror/mode/javascript')
var UglifyJS = require('uglify-js')
var ObjectExplorer = require('object-explorer')

var input = new CodeMirror(document.getElementById('input'), {
  mode: 'javascript',
  viewportMargin: Infinity,
  theme: 'solarized light editable',
  value: 'var x = 40 + 2\nfunction foo (left, right) {return left + right}'
})

var output = document.getElementById('output')

var outputPretty = new CodeMirror(document.getElementById('output-pretty'), {
  mode: 'javascript',
  viewportMargin: Infinity,
  readonly: true,
  theme: 'solarized light readonly'
})
var outputUgly = new CodeMirror(document.getElementById('output-ugly'), {
  mode: 'javascript',
  viewportMargin: Infinity,
  readonly: true,
  theme: 'solarized light readonly'
})

;(function () {
  var jses = document.getElementsByClassName('javascript')
  for (var i = 0; i < jses.length; i++) {
    var val = jses[i].textContent
    jses[i].innerHTML = ''
    new CodeMirror(jses[i], {
      mode: 'javascript',
      viewportMargin: Infinity,
      readonly: true,
      value: val,
      theme: 'solarized light readonly'
    })
  }
}())

function update() {
  var s;
  try {
    s = UglifyJS.parse(input.getValue())
  } catch (ex) {
    return outputHTML(escape(ex.stack || ex.message || ex))
  }
  outputAST(s)
  outputPretty.setValue(s.print_to_string({
    beautify: {'indent-level': 2}
  }))
  outputUgly.setValue(UglifyJS.minify(input.getValue(), {
    fromString: true
  }).code)
}

function escape(text) {
  if (!text) return ''
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function outputHTML(text) {
  output.innerHTML = '<pre class="cm-s-solarized">' + text + '</pre>'
  outputPretty.setValue('')
  outputUgly.setValue('')
}

var state = null
function outputAST(ast) {
  var top = output.children.length ? output.children[0].scrollTop : 0
  ast.figure_out_scope()
  output.innerHTML = ''
  var oe = new ASTExplorer(ast, state)
  oe.appendTo(output)
  state = oe.state
  output.children[0].scrollTop = top
}

function ASTExplorer(ast, state) {
  ObjectExplorer.call(this, ast, state)
}
ASTExplorer.prototype = Object.create(ObjectExplorer.prototype)
ASTExplorer.prototype.constructor = ASTExplorer

ASTExplorer.prototype.isInline = function (obj, path) {
  if (obj instanceof UglifyJS.Dictionary && obj.size() === 0) {
    return true
  }
  return ObjectExplorer.prototype.isInline.call(this, obj)
}
ASTExplorer.prototype.getNodeForObject = function (obj, path) {
  if (typeof obj.TYPE === 'string') {
    var docs = UglifyJS['AST_' + obj.TYPE]
    var outer = document.createElement('div')
    outer.appendChild(document.createTextNode('{'))

    outer.appendChild(this.getNodeForProperty('TYPE', obj.TYPE, docs.documentation, path.concat('TYPE')))

    for (var i = 0; i < docs.PROPS.length; i++) {
      var parent = docs
      var propdoc = null
      while (parent && propdoc === null) {
        if (parent.propdoc && docs.PROPS[i] in parent.propdoc) {
          propdoc = parent.propdoc[docs.PROPS[i]]
        } else {
          parent = parent.BASE
        }
      }
      outer.appendChild(this.getNodeForProperty(docs.PROPS[i], obj[docs.PROPS[i]], propdoc, path.concat(docs.PROPS[i])))
    }

    outer.appendChild(document.createTextNode('}'))
    return outer
  } else if (obj instanceof UglifyJS.Dictionary) {
    if (obj.size() === 0) return document.createTextNode('{}')
    var outer = document.createElement('div')

    var dictionary = document.createElement('div')
    dictionary.setAttribute('class', 'dictionary-label')
    /*var dictionaryLab = document.createElement('strong')
    dictionaryLab.innerText = 'Dictionary'*/
    dictionary.appendChild(document.createTextNode('Dictionary'))
    var methods = {
      set: ['key', 'val'],
      add: ['key', 'val'],
      get: ['key'],
      del: ['key'],
      has: ['key'],
      each: ['func(val, key)'],
      map: ['func(val, key)']
    }
    Object.keys(methods).forEach(function (method, i) {
      if (i === 0) dictionary.appendChild(document.createTextNode('  '))
      else dictionary.appendChild(document.createTextNode(', '))
      var fn = document.createElement('code')
      fn.appendChild(document.createTextNode(method + '('))
      methods[method].forEach(function (param, i) {
        if (i != 0) fn.appendChild(document.createTextNode(', '))
        var p = document.createElement('span')
        p.setAttribute('class', 'atom')
        p.appendChild(document.createTextNode(param))
        fn.appendChild(p)
      })
      fn.appendChild(document.createTextNode(')'))
      dictionary.appendChild(fn)
    })
    outer.appendChild(dictionary)


    outer.appendChild(document.createTextNode('{'))

    var self = this
    obj.each(function (val, key) {
      outer.appendChild(self.getNodeForProperty(key, val, '', path.concat(key)))
    })

    outer.appendChild(document.createTextNode('}'))
    return outer
  } else {
    return ObjectExplorer.prototype.getNodeForObject.call(this, obj, path)
  }
}



input.on('change', update)
update()