/* @flow */
'use strict';



let mongoose = require('mongoose');
// var tree = require('mongoose-tree');
var tree = require('mongoose-path-tree');

module.exports  = function() {


  var UserSchema = new mongoose.Schema({
    name : String
  });
  UserSchema.plugin(tree);
  var User = mongoose.model('User', UserSchema);

  var adam = new User({ name : 'Adam' });
  var bob = new User({ name : 'Bob' });
  var carol = new User({ name : 'Carol' });

  // Set the parent relationships
  bob.parent = adam;
  carol.parent = bob;
  console.log('running treePluginTest');
  adam.save(function() {
    console.log('adam saved');
    bob.save(function() {
      console.log('bob saved');
      carol.save();
      console.log('carol saved');
    });
  });


};
