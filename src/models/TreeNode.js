/* @flow */
'use strict';
// import co from 'co';

let mongoose = require('mongoose');
// var co = require('co');

var treePlugin = require('mongoose-path-tree');

module.exports = function() {
let TreeNodeSchema = new mongoose.Schema({
  // _id: mongoose.Schema.Types.ObjectId,
  // parent: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'TreeNode',
  //   required: false //'TreeNode: "{VALUE}" is an invalid parent!'
  // },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TreeNode',
    required: true,
    default: [] // tocheck: kein verschachteltes Array
  }],
  text: {
    type: String,
    required: 'TreeNode: "{VALUE}" (needs 3 chars) is an invalid text!',
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
  timestamps: true // Ok, works
});

// FIXME:
TreeNodeSchema.plugin(treePlugin);

TreeNodeSchema.static('findByTitle', function (title) {
  return this.find({ title: title });
});

// TreeNodeSchema.static('findByID', function (id) {
//   return this.findOne({ _id: id });
// });

// FIXME: this funktioniert nicht!!!
TreeNodeSchema.methods.validateNodeSync = () => {
  console.log('validateNodeSync started');
  let errorObj = this.validateSync();
  if (errorObj) {
    // return error Message
    let msg= 'TreeNode ' + errorObj.toString();
    console.error(msg);
    console.log('validateNodeSync ended with findings');
    return msg;
  }
  console.log('validateNodeSync ended correctly: no findings');
  return null;
};

TreeNodeSchema.methods.registerChild = function(newChildId, position=-1) {
  //parent Node führt aus
  let currentPosition = this.children.indexOf(newChildId);
  if (currentPosition !==  -1) {
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

mongoose.model('TreeNode', TreeNodeSchema);
};
