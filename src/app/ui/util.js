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
      var value = json[key]
      var arr = value.split(' ')
      if (arr[0] === 'address:') {
        var index = arr.length - 1
        var umAddress = base58.HexAddressToUmAddress(arr[index])
        var newValue = ''
        if (index === 1) {
          newValue = arr[0] + ' ' + umAddress
        } else if (index === 2) {
          newValue = arr[0] + ' ' + arr[1] + ' ' + umAddress
        }
        json[key] = newValue
      }
    }
    return treeView.render(json)
  }
}
