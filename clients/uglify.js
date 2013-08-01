var util = require('util')
var CodeMirror = require('code-mirror/mode/javascript')
var UglifyJS = require('uglify-js')

var input = new CodeMirror(document.getElementById('input'), {
  mode: 'javascript',
  viewportMargin: Infinity,
  theme: 'solarized light editable',
  value: 'var x = 40 + 2'
})

var output = document.getElementById('output')

input.on('change', update)
update()
function update() {
  var s;
  try {
    s = UglifyJS.parse(input.getValue())
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
  ast.figure_out_scope()
  outputHTML('')
  output.getElementsByTagName('pre')[0].appendChild(formatAST(ast))
}
function formatAST(ast) {
  if (Array.isArray(ast)) {
    if (ast.length === 0) return document.createTextNode('[]')
    ast = ast.map(function (node) { return formatAST(node, '') })
    var outer = document.createDocumentFragment()
    outer.appendChild(document.createTextNode('['))
    var buf = document.createElement('div')
    buf.setAttribute('style', 'padding-left: 1em')
    ast.forEach(function (node) { buf.appendChild(node) })
    outer.appendChild(buf)
    outer.appendChild(document.createTextNode(']'))
    return outer
  } else if (typeof ast === 'object' && ast && typeof ast.TYPE === 'string') {
    var docs = UglifyJS['AST_' + ast.TYPE]
    var outer = document.createDocumentFragment()
    outer.appendChild(document.createTextNode('{\n'))
    var buf = document.createElement('div')
    buf.setAttribute('style', 'padding-left: 1em')
    var prop = document.createElement('span')
    prop.setAttribute('class', 'property')
    prop.appendChild(document.createTextNode('TYPE: '))
    prop.appendChild(formatAST(ast.TYPE))
    buf.appendChild(prop)
    var desc = document.createElement('span')
    desc.setAttribute('class', 'description')
    desc.appendChild(document.createTextNode(escape(docs.documentation)))
    buf.appendChild(desc)
    buf.appendChild(document.createTextNode('\n'))

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
      buf.appendChild(formatProperty(docs.PROPS[i], ast[docs.PROPS[i]], propdoc))
    }
    outer.appendChild(buf)
    outer.appendChild(document.createTextNode('}'))
    return outer
  } else if (ast && typeof ast === 'object' && ast instanceof UglifyJS.Dictionary) {
    if (ast.size() === 0) return document.createTextNode('{}')
    var outer = document.createDocumentFragment()
    outer.appendChild(document.createTextNode('{\n'))
    var buf = document.createElement('div')
    buf.setAttribute('style', 'padding-left: 1em')

    ast.each(function (value, key) {
      buf.appendChild(formatProperty(key, value))
    })
    outer.appendChild(buf)
    outer.appendChild(document.createTextNode('}'))
    return outer
  } else if (ast && typeof ast === 'object' && ast instanceof UglifyJS.SymbolDef) {
    var outer = document.createDocumentFragment()
    outer.appendChild(document.createTextNode('{\n'))
    var buf = document.createElement('div')
    buf.setAttribute('style', 'padding-left: 1em')

    Object.keys(ast).forEach(function (key) {
      buf.appendChild(formatProperty(key, ast[key]))
    })
    outer.appendChild(buf)
    outer.appendChild(document.createTextNode('}'))
    return outer
  } else if (['string', 'number'].indexOf(typeof ast) != -1) {
    var elem = document.createElement('span')
    elem.setAttribute('class', 'cm-' + (typeof ast))
    elem.appendChild(document.createTextNode(util.inspect(ast)))
    return elem
  } else if (typeof ast === 'boolean' || ast === null || ast === undefined) {
    var elem = document.createElement('span')
    elem.setAttribute('class', 'cm-atom')
    elem.appendChild(document.createTextNode(util.inspect(ast)))
    return elem
  } else {
    console.dir(ast && ast.constructor && ast.constructor.name)
    return document.createTextNode(util.inspect(ast))
  }
}
function formatProperty(name, node, description) {
  var buf = document.createDocumentFragment()

  if (!description && typeof node === 'object' && node) {
    if (node instanceof UglifyJS.Dictionary) {
      description = '[Dictionary]'
    } else if (node instanceof UglifyJS.SymbolDef) {
      description = '[SymbolDef]'
    }
  } else if (typeof node === 'object' && node && node instanceof UglifyJS.Dictionary) {
    description = description.replace(/^\[Object/, '[Dictionary')
  }

  var prop = document.createElement('span')
  prop.setAttribute('class', 'property')

  var propName = document.createElement('span')
  propName.setAttribute('class', 'cm-property')
  propName.appendChild(document.createTextNode(name))
  prop.appendChild(propName)
  prop.appendChild(document.createTextNode(': '))

  var propDescription = document.createElement('span')
  propDescription.setAttribute('class', 'description')
  propDescription.appendChild(formatDocs(description))

  if ((Array.isArray(node) && node.length != 0) ||
      (!Array.isArray(node) && node && typeof node == 'object' && (!(node instanceof UglifyJS.Dictionary) || node.size()))) {
    var expand = document.createElement('button')
    expand.setAttribute('class', 'expand-button')
    expand.appendChild(document.createTextNode('(+)'))
    prop.appendChild(expand)
    var row = document.createElement('div')
    row.appendChild(prop)
    row.appendChild(propDescription)
    buf.appendChild(row)
    var formattedContainer = document.createElement('div')
    formattedContainer.setAttribute('style', 'padding-left: 1em;display: none;')
    buf.appendChild(formattedContainer)
    makeExpander(expand, formattedContainer, node)
  } else {
    prop.appendChild(formatAST(node))
    buf.appendChild(prop)
    buf.appendChild(propDescription)
    buf.appendChild(document.createTextNode('\n'))
  }
  return buf
}
function formatDocs(doc) {
  return document.createTextNode(doc || '')
}

function makeExpander(button, expandable, ast) {
  var expanded = false
  var created = false
  button.addEventListener('click', function () {
    if (!created) {
      expandable.appendChild(formatAST(ast))
      created = true
    }
    if (expanded) {
      expanded = false
      button.innerHTML = '(+)'
      expandable.style.display = 'none'
    } else {
      expanded = true
      button.innerHTML = '(-)'
      expandable.style.display = 'block'
    }
  }, false)
}