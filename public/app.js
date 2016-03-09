/* @flow */
'use strict';



$('#jstree_demo')
// listen for event
.on('changed.jstree', function (e, data) {
var i, j, r = [];
for(i = 0, j = data.selected.length; i < j; i++) {
r.push(data.instance.get_node(data.selected[i]).text);
}
$('#event_result').html('Selected: ' + r.join(', '));
})
.on('create_node.jstree', function (e, data) {
// log
// text, parent, position
console.log('create_node EVENT');
console.dir(data);
})
.on('rename_node.jstree', function (e, data) {
// log
// text, parent, position
console.log('rename_node EVENT');
$.post('/change', {data: data.node}).then(function(obj) {
	if (obj.error) {
		alert(obj.error);
		// change back!!!
		data.node.text = data.old ;
	}
});
console.dir(data);
})
	.jstree({
		'core' : {
			'animation' : 0,
			'check_callback' : true,
			'themes' : { 'stripes' : true },
			'data' : function(node, cb){
					console.log('node url open: children of ' + node.id);
					var parent = node.id;
					if (parent === '#')
					parent = 'root';
					$.ajax("/children/" + parent, {
			      success: function(response) {
			        if (response.error) {
								alert(response.error);
								return;
							}
			        if ( ! response.data) {
								alert('no data in response');
								return;
							}
							var data = transformNodeArr(response.data, node.id);
							console.dir(data);
							// data.unshift({ 'id' : 'ajson1', 'parent' : '#', 'text' : 'Simple root node' });
							cb.call(this, data);
							return;

			      },
						error: function(error) {
              alert(error);
            },
						timeout: 3000,
			    });

				}
				// end 'data'

}});

function getTreeRef() {
	return $('#jstree_demo').jstree(true);
};

function getNextNode(node) {

};

function demo_create() {
  var ref = $('#jstree_demo').jstree(true),
    sel = ref.get_selected();
  if(sel.length !== 1) {
		console.log('demo_create: no node selected');
		return false;
  }
	sel = sel[0];
	var selNode = ref.get_node(sel);
	ref.open_node(sel);
	console.log('demo_create: selNode');
	console.dir(selNode);

// --------------
	var newNode = {text: 'TODO'};
	newNode.parent = selNode.id;
	console.log('creating node:');
	console.dir(newNode);
	// child of ActNode, wenn ActNode keinen nachfolgenden sibling hat
	// nach sibling einfügen
	// upload
	$.ajax('/create' , {
		data: {data: newNode},
		// method
		method: 'post',
		success: function(response) {
			if (response.error) {
				alert(response.error);
				return;
			}
			if ( ! response.data) {
				alert('no data in response');
				return;
			}
			// var data = transformNodeArr(response.data, node.id);
			// TODO reload parent
			selNode.children = true;
			ref.load_node(selNode);
			ref.open_node(selNode, function(){
				// TODO: highlight new node, edit mode
				let newNodeId = response.newNodeId;
				let newNode  = ref.get_node(newNodeId);
				ref.edit(newNode);
				// ref.edit()
				// TODO: getNewNodeId
			});

			console.log('response to create request:' );
			console.dir(response.data);
			// data node to compatibility
			return;

		},
		error: function(error) {
			alert(error);
		},
		timeout: 3000,
	});

	// sel = ref.create_node(sel, {'type':'file'});
  // if(sel) {
  //   ref.edit(sel);
  // }
};

function addNodeToTree(node) {
	var ref = getTreeRef();
	ref.create_node(node.parent, node);
	// goto Edit mode
};

function demo_rename() {
  var ref = $('#jstree_demo').jstree(true),
    sel = ref.get_selected();
  if(!sel.length) {
    return false;
  }
  sel = sel[0];
  ref.edit(sel);
};
function demo_delete() {
  var ref = $('#jstree_demo').jstree(true),
    sel = ref.get_selected();
  if(!sel.length) {
    return false;
  }
  ref.delete_node(sel);
};



// transform children
//  - _id to id
//  - children: true
//  - parent: node from function paramerter
var transformNodeArr;

transformNodeArr = function(arr, parent) {
  return arr.map(function(x) {
    x.id = x._id;
    delete x._id;
    x.children = true;
    x.parent = parent;
		// FIXME:
		x.title = x.title + ' ** ' + x.id;
		// delete x.title;
		x.state = {opened :  false};
    return x;
  });
};

// keyboard listener
// up, down
// enter
// F2
$(document).bind('keypress', tell);
function tell(evt) {
 var key = evt.keyCode;
 switch(key) {
    case 38:
			// up
			console.log('up');
			tree_up();
      break;
    case 40:
			// down
        break;
    case 13:
			// return
        break;
    case 113:
			// F2
			demo_rename();
        break;
    default:
        break;

}
};
