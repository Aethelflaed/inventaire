CONFIG = require 'config'
__ = CONFIG.universalPath
{ buildSearcher } = __.require 'lib', 'elasticsearch'

invEntitiesIndex = CONFIG.db.name 'entities'
index = "wikidata,#{invEntitiesIndex}"

module.exports = buildSearcher
  index: index
  queryBodyBuilder: require './common_query_body_builder'