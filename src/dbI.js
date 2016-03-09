/* @flow */
'use strict';

var mongoose = require('mongoose');

import TreeNodeShema from './models/TreeNode.js' ;
TreeNodeShema();

// treePluginTest
// import treePluginTest from './treePluginTest';
// treePluginTest();



import co from 'co';
//--------------------------------------------
// database Interface
let dbI = {

  TreeNode: null,
  rootId: '000000000000000000000000',
  deletedRootId: '000000010000000000000000',
  errorRootId: '000000020000000000000000',
  initDone: false,
  ObjectId: null,

  init: () => {
    if (dbI.initDone)
      return;
    dbI.TreeNode = mongoose.model('TreeNode');
    dbI.ObjectId = mongoose.Schema.Types.ObjectId;
    dbI.findOrCreateRoot();
    dbI.initDone = true;
    // dbI.rememberId('root'); //  '000000000000000000000000'
    // dbI.rememberId('deletedRoot');
    // dbI.rememberId('errorRoot');

  },

  rememberId: (nodeName) => {
    dbI.TreeNode.findOne({'creator':'treeStructure', 'text':nodeName})
    .then((resObj) => dbI[nodeName+'Id'] = (resObj._id));
  },

  findOrCreateRoot: () => {
    dbI.TreeNode.findOne({'creator':'treeStructure', 'text':'root'})
    .then((resObj) => {
      if(resObj == null) {
        dbI.createRoot('root', dbI.rootId);
        dbI.createRoot('deletedRoot', dbI.deletedRootId);
        dbI.createRoot('errorRoot', dbI.errorRootId);
      }
      if(resObj._id  != dbI.rootId){
        console.error('rootNode is at wrong Id: ' + resObj._id);
        process.exit(1);
      }
    }
  );
  },

  // TODO:
  createRoot: (nodeName, id) => {
    let newObj = {text: nodeName, creator: 'treeStructure', children: []};
    newObj._id = id;
    // let objId = new mongoose.Schema.Types.ObjectId(id);
    console.log('createRoot: mongoose ... ObjectId passed');
    let newNode = new dbI.TreeNode(newObj);
    // newNode._id = objId;
    newNode.save();
  },


  getAllAlt: (query={}) => {
    return dbI.TreeNode.find(query, dbI.outputProjection);
  },

  getAll: (query={}) => {
    return new Promise((resolve, reject) => {
      // TODO:
      let previousRoot;
      let lastOpenedNode;
      let lastEditedNode;
      let lastCreatedNode;
      let nodesPromise =  dbI.TreeNode.find(query, dbI.outputProjection);
      let rootPromise = dbI.get();
      let allPromise  = Promise.all([nodesPromise, rootPromise]);
      co(function*() {
        let [nodes, root] = yield allPromise;
        resolve({nodes, root});
        return;
      }).catch(function(err) {
      // error
      console.error('getAll failed (co-Iterator)');
      console.error(err.stack);
      });
    });
  },


  // External, can return nodePromise or nullPromise
  get: (id, projection = dbI.outputProjection) => {
    let _id = dbI.translateExtId(id);
    console.log('translatedId: ' + _id);
    if (!(_id)) {
      return dbI.newNullPromise();
    }
    try {
      return dbI.TreeNode.findById(_id, projection);
    }
    catch (e) {
      return dbI.newNullPromise();
    }
  },

  getFull: (id=dbI.rootId) => {
    return dbI.get(id, {});
  },

  translateExtId: (id) => {
    if (id  === '#'  || id === 'root'  || id === false) {
      id =  dbI.rootId;
    }
    // validate
    if (dbI.validateId(id)  == false) {
      return null;
    }
    return id;
  },

  validateId: (id)  => {
    return /^[0-9a-fA-F]{24}$/ .test(id) ;
    // return mongoose.Types.ObjectId.isValid(id);
  },

  newErrorPromise: (mixedObj)  => {
    return new Promise((resolve, reject) => {
      if (typeof mixedObj  === 'string')
        mixedObj = {error: mixedObj};
      resolve(mixedObj);
    });
  },
  newNullPromise: ()  => {
    return new Promise((resolve, reject) => {
      resolve(null);
    });
  },
  newObjPromise: (obj)  => {
    return new Promise((resolve, reject) => {
      resolve(obj);
    });
  },

  // parent system, unordered
  getUnorderedChildNodesOf:  (parentId) => {
    // nodes with parent #: dbI.rootId
    let query = {};
    query.parent = dbI.translateExtId(parentId);
    return dbI.TreeNode.find(query, dbI.outputProjection);
  },

  // external, can return {error:'xxx'}, {data:[...]}
  getOrderedChildNodesOf:  (parentId) => {
    parentId = dbI.translateExtId(parentId);
    if ( ! parentId) {
      return dbI.newErrorPromise('invalid parentId');
    }
    return new Promise((resolve, reject) => {
      co(function*() {
        let childArr = yield dbI.getOrderedChildNodesArrayOf(parentId);
        resolve({success: true, data: childArr});

      }).catch(function(err) {
      // error
      console.error('dbI.getOrderedChildNodesOf failed (co-Iterator)');
      console.error(err.stack);
      });
    });
  },

  // children system, ordered
  getOrderedChildNodesArrayOf:  (parentId) => {
    return new Promise((resolve, reject) => {
    // nodes with parent #: dbI.rootId
    let populatedParentPromise = dbI.get(parentId, dbI.onlyChildrenProjection)
    .populate('children', dbI.noParentChildrenProjection)
    .exec();
    co(function*() {
      let populatedParent = yield populatedParentPromise;
      if (populatedParent  &&  populatedParent.children) {
        // resolve Promise
        resolve(populatedParent.children);
        return;
      }
      resolve(null);
      return;
    }).catch(function(err) {
    // error
    console.error('dbI.getOrderedChildNodesOf failed (co-Iterator)');
    console.error(err.stack);
    });
    });
  },


  saveNew: (newObj) => {
    return new Promise((resolve, reject) => {
      let error = null;
      let newNode =null;
      if ((newObj == null) || (typeof newObj != 'object')) {
        dbI.errorHandler('saveNew: newObj is no valid object', resolve);
        return;
      }
      newObj.parent = dbI.translateExtId(newObj.parent);
      delete newObj._id;
      newNode = new dbI.TreeNode(newObj);
      error = dbI.validateNodeSync(newNode);
      if (error) {
        dbI.errorHandler (error, resolve); // resolve Absicht
        return;
      }
      // getParent
      let parentPromise = dbI.getFull(newNode.parent);
      co(function*() {
        let parent = yield parentPromise;
        if (parent == null) {
          dbI.errorHandler('parent Node not found', resolve);
          return;
        }
        newNode.parent = parent; // mongoose-tree plugin
        console.log('saveNew: write Process');
        let savedNewNode = yield newNode.save();
        console.log('newNode saved');
        parent.registerChild(savedNewNode._id);
        parent= yield parent.save();
        console.log('parent saved');
        resolve({success: true, data: [parent, savedNewNode], newNodeId: savedNewNode._id });
      }).catch(function(err) {
      // error
      console.error('dbI.saveNew Error: Writing to DB failed (co-Iterator)');
      console.error(err.stack);
      });



      // promise ende
    });
  },

  getIdFromExternalNode: (node) => {
    if (typeof node   !== 'object'  || node == null)
      return null;
    if (node._id)
      return node._id;
    if (node.id)
      return node.id;
    return null;
  },

  outputFromFullForm: (node) => {

  },

  // no NOT reposition!!! or change parent
  // return {error: node not found ('')}
  changeNode: (node) => {
    let _id  = dbI.getIdFromExternalNode(node);
    if (_id == null)
      return dbI.newErrorPromise('changeNode: node does not contain any Id');
    let origNodePromise = dbI.getFull(_id);
    return new Promise((resolve, reject) => {
      co(function*() {
        // transferAttribute('attribute')
        let origNode = yield origNodePromise;
        if ( ! origNode) {
          resolve({error: 'changeNode: node not found: '+ _id });
          return;
        }
        dbI.transferAttribute(node, origNode, 'text');
        dbI.transferAttribute(node, origNode, 'tooltip');
        try {
          origNode = yield origNode.save();
        }
        catch (e) {
          resolve({error: 'error writing changes'});
          return;
        }
        let outputNode = dbI.toOutputForm(origNode);
        resolve({success: true, data: outputNode});
        return;
      }).catch(function(err) {
      // error
      console.error('dbI.changeNode failed (co-Iterator)');
      console.error(err.stack);
      });
    });
  } ,

  errorHandler: (msg, reject) => {
    if (typeof reject !== 'function')
    console.error('dbI.errorHandler got no reject function');
    if (msg === null)
      return;
    msg= 'dbI: ' + msg;
    console.error(msg);
    reject({error: msg});
    return null;
  },

  // parent projection
  outputProjection: {tags:0, createdAt:0, updatedAt:0,
   creator:0, __v: 0,  tooltip: 0, path: 0},

  noParentChildrenProjection: {parent: 0, tags:0, createdAt:0, updatedAt:0,
   creator:0, __v: 0, children: 0, path: 0},

  tooltipProjection: {parent: 0, tags:0, createdAt:0, updatedAt:0,
     creator:0, __v: 0, children: 0, path: 0},

  onlyChildrenProjection: {_id: 0, parent: 0, tags:0, createdAt:0, updatedAt:0,
     creator:0, __v: 0, tooltip: 0,  text: 0, path: 0},

  toOutputForm: (node, projection = dbI.outputProjection) => {
    // FIXME: for key in projection
    // for (var key in projection ) {
    // Visit non-inherited enumerable keys
    let nodeReduced = node;
    Object.keys(projection).forEach( function(key) {
      delete node[key];
      console.log('toOutputForm deleted key: '  + key);
    }
    );
    return nodeReduced;
  },

  validateNodeSync: (node) => {
    console.log('validateNodeSync started');
    let errorObj = node.validateSync();
    if (errorObj) {
      // return error Message
      let msg= 'TreeNode ' + errorObj.toString();
      console.error(msg);
      console.log('validateNodeSync ended with findings');
      return msg;
    }
    console.log('validateNodeSync ended correctly: no findings');
    return null;
  },
// TODO: needs to return promise
  mapId:  function(x) {
    x.id = x._id;
    delete x._id;
    return x;
  },

  preprocessData: (data) => {
    //
    return data;
  },

  transferAttribute: (source, target, attrName) => {
    //
    if(source[attrName]) {
      target[attrName] = source[attrName];
      return true;
    }
    return false;
  }

};

// TODO: ExtNode, IntNode

dbI.init();

module.exports = dbI;
