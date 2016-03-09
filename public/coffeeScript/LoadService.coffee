class _LoadService
  constructor: (@IdResolver)->
    this.URLgetChildren = serverURL + this.URLgetChildren
    this.URLpostPreload = serverURL + this.URLpostPreload
    this.setRootId '000000000000000000000000'

  setRootId: (id)->
    this.IdResolver.unregister('#')
    this.IdResolver.unregister('root')
    this.IdResolver.register('#', id)
    this.IdResolver.register('root', id)

  #  return promise for array, return {error: ...}?
  getCachedChildrenArrayP: (jsTreeNode)->
    id = @IdResolver.resolve(jsTreeNode.id)
    return new Promise (resolve, reject)->
      if not id
        resolve({error: 'invalid Id'})
        return
      cacheResult = this.cache[id]
      if cacheResult
        resolve(cacheResult)
        return
      return this.serverReqSingle(id)

  # returns promise, id is checked and not null
  serverReqChildrenP: (parentId, jsTreeId = null)->
    try
      $.ajax this.URLgetChildren + parentId,
        error: (error) ->
          alert error
          return
        timeout: 3000
      .then (response)->
        if response.error
          alert response.error
          return
        if not response.data
          alert 'no data in response'
          return
        if not jsTreeId
          jsTreeId = parentId
        data = this.transformNodeArr(response.data, jsTreeId)
        # data.unshift({ 'id' : 'ajson1', 'parent' : '#', 'text' : 'Simple root node' });

    catch error




  serverReqPreloadP: (startLevel, goalNode)->

  serverURL: 'localhost:3000'
  URLgetChildren: '/children/'
  URLpostPreload: '/preload'

  cache: {}


  # change node or save new
  ChangeNodeOrCreateNew :  (jsTreeNode)->
    jsTreeId = jsTreeNode.id
    if not jsTreeId
      return
    id = this.IdResolver.resolve(jsTreeId)
    if not id
      # create action,
      # register then
    # else: update

  # data : (node, cb) ->
  # parent = node.id
  # if parent == '#'
  #   parent = 'root'
  # $.ajax '/children/' + parent,
  #   success: (response) ->
  #     if response.error
  #       alert response.error
  #       return
  #     if !response.data
  #       alert 'no data in response'
  #       return
  #     data = transformNodeArr(response.data, node.id)
  #     console.dir data
  #     # data.unshift({ 'id' : 'ajson1', 'parent' : '#', 'text' : 'Simple root node' });
  #     cb.call this, data
  #     return
  #   error: (error) ->
  #     alert error
  #     return
  #   timeout: 3000
  # return

# end 'data'
