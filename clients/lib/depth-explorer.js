var ObjectExplorer = require('object-explorer')

module.exports = DepthExplorer
function DepthExplorer(ast, depth) {
  this.depth = depth
  ObjectExplorer.call(this, ast)
}
DepthExplorer.prototype = Object.create(ObjectExplorer.prototype)
DepthExplorer.prototype.constructor = DepthExplorer
DepthExplorer.prototype.isInline = function (obj, depth) {
  if (depth < this.depth) {
    return true
  }
  return ObjectExplorer.prototype.isInline.call(this, obj)
}
