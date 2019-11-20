
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const __ = require('config').universalPath
const parseBbox = __.require('lib', 'parse_bbox')
const user_ = __.require('controllers', 'user/lib/user')
const error_ = __.require('lib', 'error/error')
const responses_ = __.require('lib', 'responses')

module.exports = (req, res) => {
  const { query } = req
  const reqUserId = req.user != null ? req.user._id : undefined
  return parseBbox(query)
  .then(bbox => user_.getUsersAuthorizedData(user_.byPosition(bbox), reqUserId))
  .then(responses_.Wrap(res, 'users'))
  .catch(error_.Handler(req, res))
}
