const __ = require('config').universalPath
const _ = __.require('builders', 'utils')
const user_ = __.require('controllers', 'user/lib/user')
const groups_ = __.require('controllers', 'groups/lib/groups')

module.exports = (groupId, authentifiedUserPromise) => {
  return Promise.all([
    groups_.byId(groupId),
    authentifiedUserPromise
  ])
  .then(([ group, authentifiedUser ]) => {
    const membersIds = getGroupMembersIds(group)
    const requestedId = authentifiedUser != null ? authentifiedUser._id : undefined
    return user_.byIds(membersIds)
    .then(users => ({
      users,

      // Give access to semi-private ('network') items only if the requester
      // is a group member
      accessLevel: membersIds.includes(requestedId) ? 'network' : 'public',

      feedOptions: {
        title: group.name,
        description: group.description,
        image: group.picture,
        queryString: `group=${group._id}`,
        pathname: `groups/${group._id}`
      }
    }))
  })
}

const getGroupMembersIds = group => {
  const { admins, members } = group
  return admins.concat(members).map(_.property('user'))
}
