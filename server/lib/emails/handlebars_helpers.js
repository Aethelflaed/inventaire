
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const CONFIG = require('config')
const __ = CONFIG.universalPath
const _ = __.require('builders', 'utils')
const i18n = require('./i18n/i18n')

const appApi = require('./app_api')

module.exports = Object.assign({}, i18n, {
  // Prevent passing more than 2 arguments
  debug: (obj, label) => {
    _.log(obj, label)
    return JSON.stringify(obj, null, 2)
  },

  // Keep in sync with client/app/lib/handlebars_helpers/images
  imgSrc: (path, width, height) => {
    if (isDataUrl(path)) return path

    width = getImgDimension(width, 1600)
    width = bestImageWidth(width)
    height = getImgDimension(height, width)
    path = onePictureOnly(path)

    if (path == null) return ''

    return appApi.img(path, width, height)
  }
}
)

const onePictureOnly = arg => {
  if (_.isArray(arg)) return arg[0]
  else return arg
}

const getImgDimension = (dimension, defaultValue) => {
  if (_.isNumber(dimension)) {
    return dimension
  } else {
    return defaultValue
  }
}

const isDataUrl = str => /^data:image/.test(str)

const bestImageWidth = width => {
  // under 500, it's useful to keep the freedom to get exactly 64 or 128px etc
  // while still grouping on the initially requested width
  if (width < 500) {
    return width
  // group image width above 500 by levels of 100px to limit generated versions
  } else {
    return Math.ceil(width / 100) * 100
  }
}
