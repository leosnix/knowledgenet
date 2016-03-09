class _IdResolver
  constructor: ->

  register (localId, publicId)->
    this.register[localId] = publicId
    this.backwardRegister[publicId] = localId


  unregister (localId)->
    publicId = this.resolve(localId)
    delete this.register[localId]
    delete this.backwardRegister[publicId]

  # to serverside public id
  resolve: (id)->
    translatedId = this.register[id]
    id = translatedId if translatedId
    this.checkId(id)

  resolveBakward: (id)->
    id = this.checkId(id)
    translatedId = this.backwardRegister[id]
    id = translatedId if translatedId
    id

  # id or null
  checkId: (id)->
    if /^[0-9a-fA-F]{24}$/ .test(id)
      return id
    return null

  register: {}
  backwardRegister: {}

  # check if id is local type, and not registered
  checkIdOnlyLocal: (localId)->
    if not localId
      return false
    if this.resolve(localId)
      return false
    # TODO: return regex match result
    return /^j[0-9]+_[0-9]+$/ .test(id)


# change node or save new
ChangeNodeOrCreateNew = (jsTreeNode)->
  id = jsTreeNode.id
  if not id
    return
