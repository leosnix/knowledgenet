/* @flow */
'use strict';
// import co from 'co';

let mongoose = require('mongoose');
// var co = require('co');


let TreeNodeSchema = new mongoose.Schema({
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    default: [] // tocheck: kein verschachteltes Array
  }],
  fullPath: {
    type: String,
    maxlength: 4000,
    trim:true
  },
  hierarchyLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 30,
    default: 1
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 200,
    trim:true
  },
  creator: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 80,
    default: 'developTest',
    trim:true
  },
  tooltip: {
    type: String,
    default: '',
    maxlength: 4000,
    trim:true
  },
  styleClass: {
    type: String,
    maxlength: 80,
    trim:true
  },
  // CMSString: String,
  tags: [{
    type: String,
    minlength: 1,
    maxlength: 80,
    default: [],
    trim:true
  }]
}, {
  timestamps: true //Check
});


TreeNodeSchema.methods.registerDeleted = function() {
  // if this.Id_ invalid {
  //   this.parent=todo// Treemaster
  //   this.save(cb);
  //
  // }

};


TreeNodeSchema.methods.moveHierarchyUp = function(cb) {};

TreeNodeSchema.methods.moveHierarchyDown = function(cb) {};

TreeNodeSchema.methods.moveBefore = function(otherNodeId, cb) {};

TreeNodeSchema.methods.moveAfter = function(otherNodeId, cb) {};


/*
TreeNodeSchema.methods.create = function(positionObj) {
  // Test Namelength,
  let error = this.validateSync();
  co(function*() {
   let nodes = yield Promise.all([TreeNodeSchema.(), longOperation(9)]);
   console.log(avar);
   console.log(bothvar[0] + bothvar[1]);
 }).catch(function(err) {
   console.error(err.stack);
 });

}

// {otherNodeId, qPositionAfter = true}
*/

TreeNodeSchema.methods.registerChildNoSav = function(newChildId, position) {
  //parent Node führt aus
  let currentPosition = this.children.indexOf(newChildId);

  if (currentPosition !==  -1){
    return false; // child already exists
  }
  //in children Array Liste einfügen
  let lastPosition = this.children.length;
  if ((-1  < position) &&  (position < (lastPosition - 1))) {
    this.children.splice(position, 0, newChildId); // insert before
  }
  else
  {
    this.children.push(newChildId);
  }

  return true;


};


let moveNode = function() {
  // get
};

let moveNodeWithinParent = function() {
  // get
};

TreeNodeSchema.methods.unregisterChildNoSav = function(oldNodeId) {
  let oldNodePosition = this.children.indexOf(oldNodeId);
  if (oldNodePosition >= 0) {
    this.children.splice(oldNodePosition, 1);
    return true;
  }
  else
  {
    return false;
  }
// TODO: no save here
};

TreeNodeSchema.methods.getChildPosition = function(childId) {
  return this.children.indexOf(childId);
};

TreeNodeSchema.methods.deleteNoSav = function(oldParentNodeObj, deletedRootNodeObj) {
  // TODO: get deletedRootNode

  this.setTagNoSav('deleted', true);
  this.moveNoSav(oldParentNodeObj, deletedRootNodeObj);


  // TODO: save fullPath

  // TODO: no save here

};

// TODO:  {other, qPosition} optioal
TreeNodeSchema.methods.moveNoSav = function(oldParentNodeObj, newParentNodeObj, {otherNodeId, qPositionAfter}) {
  // TODO: get newParentNodeID from otherNodeID: Node who has Child ohterNodeId....
  newParentNodeObj.registerChildNoSav(this.id, {
    otherNodeId,
    qPositionAfter
  });
  oldParentNodeObj.unregisterChildNoSav(this.id);
  this.parent = newParentNodeObj.id;

//TODO: no save here
};

TreeNodeSchema.methods.setTagNoSav = function(tag,  enable  = true) {
  let previousPosition = this.tags.indexOf(tag);
  let isEnabled  = (previousPosition  >  0);

  if (isEnabled  ===  enable){
    return;
  }
  if (enable) {
    this.tags.push(tag);
    return;
  }
  // enable== false, remove tag
  this.tags.splice(previousPosition, 1);
};

TreeNodeSchema.methods.getFullPathPromise = function() {};

/*
TreeNodeSchema.methods.moveAfter = function(otherNodeId, cb) {
  // same parent
  // get parent
  // unregisterChild
  // ASYNCHRONOUS!!!


}


TreeNodeSchema.methods.updateHierarchyLevel = function() {}

}

TreeNodeSchema.methods.updateHierarchyLevelSubtree = function() {

}
TreeNodeSchema.methods.updateTitle = function(newTitle) {
 this.title=newTitle;
 let error = this.validateSync();
 if (error == null) {
   return this.save; // promise // atomar microtransaction?
 }
 else {
   return error;
 }
}
TreeNodeSchema.methods.updateTooltip = function() {

}


TreeNodeSchema.methods.delete = function(cb) {
  // TODO: get deletedRootNode
  this.upvotes += 1;
  this.parent = null //todo deletedmaster
  // this.tags.push('deleted');
  // mark as changed ?
  this.save(cb);
};
*/


let minifyForSend = ({id_, title, children, tooltip}) => {
  return {
    id_,
    title,
    children,
    tooltip
  };
};

// TODO: save and export
mongoose.model('TreeNode', TreeNodeSchema);
// let TreeNode  =
// atomar microtransaction: update only title
