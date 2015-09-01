{ IncomingForm } = require 'formidable'
Promise = require 'bluebird'

module.exports = (req)->
  form = new IncomingForm()

  return new Promise (resolve, reject)->
    form.parse req, (err, fields, files) ->
      if err? then reject err
      else
        resolve
          fields: fields
          files: files
