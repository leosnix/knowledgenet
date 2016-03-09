/* @flow */
  'use strict' ;
var ObjectID = require('mongodb').ObjectID;
import co from 'co';

let initTree = function(db) {
  // NOTE: only direct mongodb connection OHNE mongoose
  // needs
  console.log('starting initTree...');
  // return Promis from co
  return co(function*() {
    let nodes = yield db.collection('treenodes').find({creator: 'treeStructure'}).toArray(); //should return promise
    console.log(nodes[0]);
      if (nodes.length === 0) {
      // create rootNode
      // direct DB Write ohne TreeNode model; hat kein parent
      console.log('initTree: crating treeStructure nodes');

      let rootNode = {text: 'root', creator: 'treeStructure', children: [] };
      let deletedRootNode = {text: 'deletedRoot', creator: 'treeStructure', children: []};
      let errorRootNode = {text: 'errorRoot', creator: 'treeStructure', children: []};

      rootNode._id = ObjectID.createFromTime(0);
      deletedRootNode._id = ObjectID.createFromTime(1);
      errorRootNode._id = ObjectID.createFromTime(2);

      yield db.collection('treenodes').insert(errorRootNode);
      // get _id
      let errorRootNodeArr= yield db.collection('treenodes').find({creator: 'treeStructure', text: 'errorRoot'}).toArray();
      let errorRootNodeID=errorRootNodeArr[0]._id;

      // rootNode.parent=errorRootNodeID;
      // deletedRootNode.parent=errorRootNodeID;
      // errorRootNode.parent=errorRootNodeID;

      yield Promise.all([
        db.collection('treenodes').update({_id: errorRootNodeID},errorRootNode,{}),
        db.collection('treenodes').insert(rootNode),
        db.collection('treenodes').insert(deletedRootNode)
      ]);
    } // end if
    // console.log('***UPDATING***');
    // yield db.collection('treenodes').updateMany({},
    //    { $unset: { 'level': ''} });
    //   //  { $rename: { 'title': 'text'});
    // console.log('update complete');
    console.log('initTree passed');
    return true;
    // get root nodes?
  }).catch(function(err) {
  // error handling
  console.error('initTree failed');
  console.error(err.stack);
  process.exit(1);
  });
};

let checkRootNodes = (nodeArr) => {
  // if (nodes.length === 3)
};


export default initTree;
