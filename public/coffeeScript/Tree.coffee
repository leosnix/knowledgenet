class _Tree extends jsTree
  # jsTree object?
  # soll alle Methoden von jsTree haben,
  constructor: (selectorString)->
    #check for jquery
    #check for jsTree
    this.prototype = $.jsTree(selectorString)
    #set jsTree parameters







Tree = new _Tree('#selector')
#test: sind alle Methoden vefuegbar?
console.log Tree
