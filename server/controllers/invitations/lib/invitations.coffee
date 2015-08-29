CONFIG = require 'config'
__ = CONFIG.root
_ = __.require 'builders', 'utils'
db = __.require('couch', 'base')('users', 'invited')
{ findOneByEmail, byEmails } = __.require 'lib', 'user/shared_user_handlers'
Invited = __.require 'models','invited'
promises_ = __.require 'lib', 'promises'
{ makeRequest } = __.require 'controllers', 'relations/lib/actions'

module.exports =
  findOneByEmail:findOneByEmail.bind(null, db)
  byEmails: byEmails.bind(null, db)
  createUnknownInvited: (inviterId, unknownEmails)->
    _.types arguments, ['string', 'array']
    invitedDocs = unknownEmails.map Invited.create.bind(null, inviterId)
    db.bulk invitedDocs
    .catch _.ErrorRethrow('createUnknownInvited')

  addInviter: (inviterId, invitedDocs)->
    _.types arguments, ['string', 'array']
    invitedDocs = invitedDocs.map Invited.addInviter.bind(null, inviterId)
    db.bulk invitedDocs
    .catch _.ErrorRethrow('addInviter')

  extractUnknownEmails: (emails, knownInvitedUsers)->
    knownInvitedUsersEmails = knownInvitedUsers.map _.property('email')
    return _.difference emails, knownInvitedUsersEmails

  extractNotAlreadyInvited: (userId, knownInvitedUsers)->
    return knownInvitedUsers.filter Invited.notAlreadyInvited.bind(null, userId)

  extractRemainingEmails: (notAlreadyInvited, unknownEmails)->
    knownEmails = notAlreadyInvited.map _.property('email')
    return unknownEmails.concat knownEmails

  convertInvitations: (userDoc)->
    { _id, inviters } = userDoc
    if inviters?
      invitersIds = Object.keys inviters
      promises = invitersIds.map convertInvitation.bind(null, _id)
      return promises_.all promises
    else
      return promises_.resolve()

emailNotification = false
convertInvitation = (newUserId, inviterId)->
  makeRequest inviterId, newUserId, emailNotification