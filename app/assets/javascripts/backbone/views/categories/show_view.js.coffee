Tasking.Views.Categories ||= {}

class Tasking.Views.Categories.ShowView extends Backbone.View
  template: JST["backbone/templates/categories/show"]

  #events :
  #  "submit #delete-category" : "delete"
    
  render: ->
    $(@el).html(@template(@model.toJSON() ))
    return this
