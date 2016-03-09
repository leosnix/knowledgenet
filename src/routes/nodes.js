/* @flow */
'use strict';

// let testVar  = 0;
// console.log('testVar Context: '  + this);


import co from 'co';


import express from 'express';
const router = express.Router();


import dbI from './../dbI';





//----------------------------------------------

router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

// TODO: /all, filter Attributes projection id = _id
router.get('/all', function(req, res) {
  co(function*() {
    // let nodes = yield dbI.TreeNode.find({},{parent: 0, tags:0, createdAt:0, updatedAt:0, hierarchyLevel:0, tooltip:0, creator:0}); // returns Promise?
    let data = yield dbI.getAll();
    res.json({data});
  }).catch(function(err) {
  res.json(err.stack);
  });
});

// get single node by ID
router.get('/:id', function(req, res) {
  co(function*() {
    // let nodes = yield dbI.TreeNode.findOne({_id: req.params.id},{parent: 0, tags:0, createdAt:0, updatedAt:0, hierarchyLevel:0, tooltip:0, creator:0}); // returns Promise?
    let singleNode = yield dbI.get(req.params.id);
    if (!(singleNode)) {
      res.json({'error': 'invalid id', 'requested': req.params.id});
      return;
    }
    res.json({data: singleNode});
  }).catch(function(err) {
  res.json(err.stack);
  });
});


// get ordered children nodes of parent Id
router.get('/:id/c', function(req, res) {
  co(function*() {
    let resObj = yield dbI.getOrderedChildNodesOf(req.params.id);
    res.json(resObj);
  }).catch(function(err) {
  res.json(err.stack);
  });
});

// get ordered children nodes of parent Id
router.get('/children/:id', function(req, res) {
  co(function*() {
    let resObj = yield dbI.getOrderedChildNodesOf(req.params.id);
    res.json(resObj);
  }).catch(function(err) {
  res.json(err.stack);
  });
});



// TODO: get single node by ID
router.get('/:id/full', function(req, res) {
  co(function*() {
    // let nodes = yield dbI.TreeNode.findOne({_id: req.params.id},{parent: 0, tags:0, createdAt:0, updatedAt:0, hierarchyLevel:0, tooltip:0, creator:0}); // returns Promise?
    let singleNode = yield dbI.getFull(req.params.id);
    res.json({data: singleNode});
  }).catch(function(err) {
  res.json(err.stack);
  });
});


router.post('/create', function(req, res) {
  if (req.body==null || req.body.data==null) {
    res.json({error: 'Post-Request needs valid data key!', requested:req.body});
    return;
  }
  dbI.saveNew(req.body.data).then((obj)=>res.json(obj)); // function json mit dem Objekt aufrufen
});


router.post('/change', function(req, res) {
  if (req.body==null || req.body.data==null) {
    res.json({error: 'Post-Request needs valid data key!', requested:req.body});
    return;
  }
  dbI.changeNode(req.body.data).then((obj)=>res.json(obj)); // function json mit dem Objekt aufrufen
});


router.post('/createAlt', function(req, res) {
  co(function*() {
    let data = req.body.data;
    let error = null;
    let newNode =null;
    if (data) {
      newNode = new dbI.TreeNode(data);
      let errorObj = newNode.validateSync(); // TODO: Als dbI.TreeNode Methode
      if (errorObj) {
        error='dbI.TreeNode ' + errorObj.toString();
      }
    }
    else {
      error = 'Post-Request needs valid data key!';
    }

    if (error) {
      console.error('route/create: '+ error);
      res.json({error: error});
      return;
    }
    // alles Ok, write to DB
    let n2 =yield newNode.save();
    res.json({data: n2});
  }).catch(function(err) {
  res.json('UNHANDLED EXCEPTION in /crate route' + err.stack);
  });
});




router.get('/about', function(req, res) {
  res.send('nodes about');
});

export default router;
