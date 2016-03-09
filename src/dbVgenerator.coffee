'use strict'

mongoose = require('mongoose')


dbVgenaerator = () ->
  # TODO: return promise
  db = mongoose.connection.db
  variables = db.collection('variables')
  # downloadAll
  aktuellPromise = variables.findOne(_id: 'aktuell')
  aktuellPromise.then (aktuellObj) ->
    if aktuellObj
      # resolvePromise aktuellObj
      # save Backup with _id = date
      return
    #else
    dbV = {
      connect:  ->
        dbV.db = mongoose.connection.db
        dbV.variables = dbV.db.collection('variables')

      init:  ->
        dbV.connect()

      get: (name)->
        return dbV[name]

      set: (name, val)->
        dbV[name] = val
        # update database
        # atomic change document aktuell
        try
          dbV.variables.updateOne {_id: aktuell}, {$set: {name: val}}
        catch error
          console.error 'dbV: write to db failed'
          console.error error.stack

    }
    # upload dbV to db
    variables.insert({_id: 'aktuell', dbV: dbV})
    # resolvePromise dbV
    return
