__ = require('config').universalPath
_ = __.require 'builders', 'utils'
promises_ = __.require 'lib', 'promises'
error_ = __.require 'lib', 'error/error'
entities_ = require './entities'
runWdQuery = __.require 'data', 'wikidata/run_query'
{ prefixifyWd } = __.require 'controllers', 'entities/lib/prefix'
{ getSimpleDayDate, sortByOrdinalOrDate } = require './queries_utils'

module.exports = (params)->
  { uri, refresh, dry } = params
  [ prefix, id ] = uri.split ':'
  promises = []

  # If the prefix is 'inv' or 'isbn', no need to check Wikidata
  if prefix is 'wd' then promises.push getWdSerieParts(id, refresh, dry)

  promises.push getInvSerieParts(uri)

  promises_.all promises
  .then (results...)->
    parts: _.flatten(results...).sort(sortByOrdinalOrDate)
  .catch _.ErrorRethrow('get serie parts err')

getWdSerieParts = (qid, refresh, dry)->
  runWdQuery { query: 'serie-parts', qid, refresh, dry }
  .map (result)->
    uri: prefixifyWd result.part
    date: getSimpleDayDate result.date
    ordinal: result.ordinal

getInvSerieParts = (uri)->
  # Querying only for 'serie' (wdt:P179) and not 'part of' (wdt:P361)
  # as we use only wdt:P179 internally
  entities_.byClaim 'wdt:P179', uri, true
  .get 'rows'
  .map parseRow

parseRow = (row)->
  uri: "inv:#{row.id}"
  date: row.doc.claims['wdt:P577']?[0]
  ordinal: row.doc.claims['wdt:P1545']?[0]
