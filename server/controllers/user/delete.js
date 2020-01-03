const __ = require('config').universalPath
const _ = __.require('builders', 'utils')
const error_ = __.require('lib', 'error/error')
const responses_ = __.require('lib', 'responses')
const promises_ = __.require('lib', 'promises')
const relations_ = __.require('controllers', 'relations/lib/queries')
const deleteUserItems = __.require('controllers', 'items/lib/delete_user_items')
const { leaveAllGroups } = __.require('controllers', 'groups/lib/leave_groups')
const notifs_ = __.require('lib', 'notifications')
const { Track } = __.require('lib', 'track')
const { softDeleteById } = __.require('controllers', 'user/lib/delete')

module.exports = (req, res) => {
  const reqUserId = req.user._id

  _.warn(req.user, 'deleting user')

  softDeleteById(reqUserId)
  .then(cleanEverything.bind(null, reqUserId))
  // triggering track before logging out
  // to get access to req.user before it's cleared
  .tap(Track(req, [ 'user', 'delete' ]))
  .then(req.logout.bind(req))
  .then(responses_.Ok(res))
  .catch(error_.Handler(req, res))
}

// what should happen to old:
// commentaries => deleted (the user will expect it to clean her online presence )
// transactions => kept: those are private and remain useful for the other user

const cleanEverything = reqUserId => {
  return promises_.all([
    relations_.deleteUserRelations(reqUserId),
    deleteUserItems(reqUserId),
    leaveAllGroups(reqUserId),
    notifs_.deleteAllByUserId(reqUserId)
  ])
}