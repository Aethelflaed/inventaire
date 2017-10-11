# A middleware to catch other middlewares errors and repackage them
# in JSON and with more readable error reports
CONFIG = require 'config'
__ = CONFIG.universalPath
_ = __.require('builders', 'utils')
error_ = __.require 'lib', 'error/error'
{ logoutRedirect } = __.require 'controllers', 'auth/connection'

module.exports = (err, req, res, next) ->
  # Repackaging errors generated by body-parser
  if err.name is 'SyntaxError' and err.message.startsWith('Unexpected token')
    error_.bundle req, res, 'invalid JSON body', 400
  else if err.name is 'SessionError'
    { pathname } = req._parsedUrl
    logoutRedirect "/login?redirect=#{pathname}", req, res, next
  else
    error_.handler req, res, err
