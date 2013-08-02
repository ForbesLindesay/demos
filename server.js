var path = require('path')
var fs = require('fs')

var browserify = require('browserify-middleware')
var jade = require('transform')('jade')
var css = require('transform')('css')
var express = require('express')
var app = express()

browserify.settings('transform', ['rfileify'])

var versions = require('./package.json').dependencies
var version = require('./package.json').version

console.dir(version)
jade.settings({
  version: version,
  versions: versions
})

app.use(express.favicon(__dirname + '/style/favicon.ico'))
app.use(express.logger('dev'))

app.get('/', jade('./views/index.jade'))

app.get('/uglify-js', jade('./views/uglify.jade'))
app.get('/static/' + version + '/uglify.js', browserify('./clients/uglify.js'))

app.get('/htmlparser2', jade('./views/htmlparser2.jade'))
app.get('/static/' + version + '/htmlparser2.js', browserify('./clients/htmlparser2.js'))

app.get('/static/' + version + '/style.css', function (req, res) {
  res.type('css')
  var css = fs.readFileSync(__dirname + '/style/style.css', 'utf8')
  css = css.replace(/{{version}}/g, version)
  res.send(css)
})
app.get('/static/' + version + '/background.png', file('./style/background.png'))
app.get('/static/' + version + '/forkme.png', file('./style/forkme.png'))

function file(pth) {
  pth = path.resolve(__dirname, pth)
  if (!fs.existsSync(pth)) {
    throw new Error('Could not find ' + pth)
  }
  return function (req, res, next) {
    res.sendfile(pth)
  }
}

app.listen(3000)