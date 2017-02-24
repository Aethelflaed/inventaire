CONFIG = require 'config'
__ = CONFIG.universalPath
_ = __.require 'builders', 'utils'
error_ = __.require 'lib', 'error/error'
tests = __.require 'models','tests/common-tests'
promises_ = __.require 'lib', 'promises'
groups_ = require './lib/groups'
user_ = __.require 'controllers', 'user/lib/user'
items_ = __.require 'controllers', 'items/lib/items'
parseBbox = __.require 'lib', 'parse_bbox'

module.exports =
  byId: (req, res)->
    { id } = req.query
    reqUserId = req.user?._id
    unless tests.valid 'groupId', id
      throw error_.new 'invalid group id', 400, id

    groups_.getGroupData id, reqUserId
    .then res.json.bind(res)
    .catch error_.Handler(req, res)

  searchByName: (req, res)->
    { search } = req.query
    unless _.isNonEmptyString search
      throw error_.new 'invalid search', 400, search

    groups_.nameStartBy search
    .filter searchable
    .then res.json.bind(res)
    .catch error_.Handler(req, res)

  searchByPositon: (req, res)->
    (query)->
    parseBbox req.query
    .then (bbox)->
      # can't be chained directy as .filter makes problems when parseBbox throws:
      # "parseBbox(...).then(...).then(...).catch(...).filter is not a function"
      groups_.byPosition bbox
      .filter searchable
    .then res.json.bind(res)
    .catch error_.Handler(req, res)

  lastGroups: (req, res)->
    groups_.byCreation()
    .filter searchable
    .then res.json.bind(res)
    .catch error_.Handler(req, res)

searchable = _.property 'searchable'