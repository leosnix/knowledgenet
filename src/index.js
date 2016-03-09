/* @flow */
'use strict';

import co from 'co';
import dbConnect from './dbConnect.js';
import initTree from './initTree.js';
import server from './server.js';
// import colors from 'colors';
import dbVgenerator from './dbVgenerator.js';


// mongoose connection
// var mongoose = require('mongoose');
// let TreeNode = require('./models/TreeNode.js');
// TreeNode();

console.log('***STARTING SERVER***');

let initProcess = co(function*() {
  console.log('db starting...');
  let db= yield dbConnect();
  //
  // let dbV = yield dbVgenerator(db);
  // dbV.set('test', 'me');
  // dbV.set('test2', 'me2');
  // dbV.set('test3', 'me3');
  // console.log('dbVPromie done');
  // console.log(dbV.get('test3'));
  //
  console.log('db OK');
  // yield initTree(db);
  return db;
}).catch(function(err) {
// error
console.error('Init in index.js failed (co-Iterator)');
console.error(err.stack);
});

// server should get db
initProcess.then(server);
