var async = require('async')
var base58 = require('../base58')

module.exports = {
  shortenAddress: function (address, etherBalance) {
    var umAddress = base58.HexAddressToUmAddress(address)
    var len = umAddress.length
    return umAddress.slice(0, 5) + '...' + umAddress.slice(len - 5, len) + (etherBalance ? ' (' + etherBalance.toString() + ' use)' : '')
  },
  shortenHexData: function (data) {
    if (!data) return ''
    if (data.length < 5) return data
    var len = data.length
    return data.slice(0, 5) + '...' + data.slice(len - 5, len)
  },
  createNonClashingNameWithPrefix (name, fileProvider, prefix, cb) {
    var counter = ''
    var ext = 'sol'
    var reg = /(.*)\.([^.]+)/g
    var split = reg.exec(name)
    if (split) {
      name = split[1]
      ext = split[2]
    }
    var exist = true
    async.whilst(
      () => { return exist },
      (callback) => {
        fileProvider.exists(name + counter + prefix + '.' + ext, (error, currentExist) => {
          if (error) {
            callback(error)
          } else {
            exist = currentExist
            if (exist) counter = (counter | 0) + 1
            callback()
          }
        })
      },
      (error) => { cb(error, name + counter + prefix + '.' + ext) }
    )
  },
  createNonClashingName (name, fileProvider, cb) {
    this.createNonClashingNameWithPrefix(name, fileProvider, '', cb)
  },
  checkSpecialChars (name) {
    return name.match(/[/:*?"<>\\'|]/) != null
  },
  find: find
}

function findDeep (object, fn, found = { break: false, value: undefined }) {
  if (typeof object !== 'object' || object === null) return
  for (var i in object) {
    if (found.break) break
    var el = object[i]
    if (el && el.innerText !== undefined && el.innerText !== null) el = el.innerText
    if (fn(el, i, object)) {
      found.value = el
      found.break = true
      break
    } else {
      findDeep(el, fn, found)
    }
  }
  return found.value
}

function find (args, query) {
  query = query.trim()
  var isMatch = !!findDeep(args, function check (value, key) {
    if (value === undefined || value === null) return false
    if (typeof value === 'function') return false
    if (typeof value === 'object') return false
    var contains = String(value).indexOf(query.trim()) !== -1
    return contains
  })
  return isMatch
}

