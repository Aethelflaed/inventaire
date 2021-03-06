const CONFIG = require('config')
const __ = CONFIG.universalPath
let error_ = __.require('lib', 'error/error')
const { tap } = __.require('lib', 'promises')
const getEntityByUri = __.require('controllers', 'entities/lib/get_entity_by_uri')
const tasks_ = require('./tasks')
const getNewTasks = require('./get_new_tasks')
error_ = __.require('lib', 'error/error')
const updateRelationScore = require('./relation_score')
const supportedTypes = [ 'human' ]

module.exports = async uri => {
  if (uri.split(':')[0] !== 'inv') {
    throw error_.new('invalid uri domain', 400, { uri })
  }

  return getEntityByUri({ uri })
  .then(entity => {
    if (entity == null) throw error_.notFound({ uri })

    if (entity.uri.split(':')[0] === 'wd') {
      throw error_.new('entity is already a redirection', 400, { uri })
    }

    if (!supportedTypes.includes(entity.type)) {
      throw error_.new(`unsupported type: ${entity.type}`, 400, { uri, supportedTypes })
    }

    return getExistingTasks(uri)
    .then(getNewTasks(entity))
    .then(tasks_.createInBulk)
    .then(tap(() => updateRelationScore(uri)))
  })
}

const getExistingTasks = uri => tasks_.bySuspectUris([ uri ])
