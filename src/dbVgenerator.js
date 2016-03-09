'use strict';
var dbVgenerator;



dbVgenerator = function(db) {
  return new Promise((resolve, reject) => {
  var aktuellPromise;
  db.collection('variables').insert({_id: 'test', value: 'test'});
  aktuellPromise = db.collection('variables').findOne({
    _id: 'aktuell'
  });
  aktuellPromise.then(function(aktuellObj) {
    var dbV;
    if (aktuellObj) {
      // resolvePromise aktuellObj
      // TODO: save Backup with _id = date
      dbV = aktuellObj;
      dbV.init(db);
      resolve(dbV);
      return;
    }
    // else: no db entry
    dbV = {
      init: function(db) {
        dbV.db = db;
      },
      get: function(name) {
        return dbV[name];
      },
      set: function(name, val) {
        var error, error1;
        dbV[name] = val;
        try {
          // return dbV.db.collection('variables').updateOne({
          //   _id: aktuell
          // }, {
          //   // todo push...
          //   $set: {
          //     dbV: dbV
          //   }
          // });
        } catch (error1) {
          error = error1;
          console.error('dbV: write to db failed');
          return console.error(error.stack);
        }
      }
    };
    // FIXME: no db write detected
    console.log('dbVgenerator: writing "aktuell"');
    // FIXME: aktuell may exist
    db.collection('variables').insert({
      _id: 'aktuell',
      dbV: dbV
    });
    // resolvePromise dbV
    // run dbV.init
    dbV.init(db);
    resolve(dbV);
    return;
  });
  });
};

module.exports = dbVgenerator;
