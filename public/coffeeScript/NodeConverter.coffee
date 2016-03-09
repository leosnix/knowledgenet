# converts jsTreeNodes to serverNodes
class _NodeConverter
  constructor: (@jsTreeInstance, @IdResolver)->

  # TODO: server soll parent attribut senden!!!
  toJsTreeNode: (serverNode)->
    serverNode.id = @IdResolver.resolveBakward serverNode._id
    delete serverNode._id
    if serverNode.parent
      serverNode.parent = @IdResolver.resolveBakward serverNode.parent
    serverNode.children = true
    serverNode.state = { opened: false }
    # FIXME:
    serverNode.title = serverNode.title + ' ** ' + serverNode.id
    serverNode


  toServerNode: (jsTreeNode)->
    serverNode = {}
    serverNode._id = @IdResolver.resolve jsTreeNode.id
    this.copyAllAttributesExcept(jsTreeNode, serverNode, @jsTreeNodeStructure)
    return serverNode

  copyAllAttributesExcept: (source, target, exceptions)->
    for key, value of source when exceptions.indexOf(key) == -1
      target[key] = value

  # parent, previousNode, null if first jsTreeNode
  getJsTreePosition: (jsTreeNode)->
    id = jsTreeNode.id
    parentId = jsTreeNode.parent
    siblingArr = @jsTreeInstance.get_node(parentId)
    position = siblingArr.indexOf(id)
    lastPosition = siblingArr.length - 1
    if position < 0
      # error
      return null
    nextSiblingId = null
    if position  + 1  <= siblingArr.length - 1
      nextSiblingId = siblingArr[position  +  1]
    # convert Ids to serverSide
    return {
      parentId: this.IdResolver.resolve(parentId)
      nextSiblingId: this.IdResolver.resolve(nextSiblingId)
      position: position
      lastPosition: lastPosition
    }

  # position in Array function

  transformJsTreePositonToPublic: (jsTreePositionObj)->


  jsTreeNodeStructure: ['a_attr', 'children', 'children_d', 'data', 'icon'
  ,'li_attr', 'original', 'parents', 'state', 'id']
