var TreeView = require('./TreeView')
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN
var remixLib = require('remix-lib')
var txFormat = remixLib.execution.txFormat
var base58 = require('../../base58')

module.exports = {
  decodeResponseToTreeView: function (response, fnabi) {
    var treeView = new TreeView({
      extractData: (item, parent, key) => {
        var ret = {}
        if (BN.isBN(item)) {
          ret.self = item.toString(10)
          ret.children = []
        } else {
          ret = treeView.extractDataDefault(item, parent, key)
        }
        return ret
      }
    })
    var json = txFormat.decodeResponse(response, fnabi)
    for (var key in json) {
      var arr = json[key].split(' ')
      if (arr[0] === 'address:') {
        var value = ''
        var i
        for (i = 0; i < arr.length - 1; i++) {
          value += arr[i] + ' '
        }
        value += base58.HexAddressToUmAddress(arr[i])
        json[key] = value
      }
    }
    return treeView.render(json)
  }
}
