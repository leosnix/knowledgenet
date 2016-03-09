/* @flow */
 'use strict' ;


 // mongoose 4.3.x
 var mongoose = require('mongoose');

 /*
  * Mongoose by default sets the auto_reconnect option to true.
  * We recommend setting socket options at both the server and replica set level.
  * We recommend a 30 second connection timeout because it allows for
  * plenty of time in most operating environments.
  */
 var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
                 replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };

 var mongodbUri = 'mongodb://localhost:27017/knowledgetree';

module.exports = function() {
  return new Promise((resolve, reject) => {


 mongoose.connect(mongodbUri, options);
 var conn = mongoose.connection;

 conn.on('error', console.error.bind(console, 'connection error:'));

 conn.once('open', function() {
   // Wait for the database connection to establish, then start the app.
   // get db driver
   resolve(conn.db);
 });


});

};
