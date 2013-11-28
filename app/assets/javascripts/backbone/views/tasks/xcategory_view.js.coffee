Tasking.Views.XCategories ||= {}

class Tasking.Views.Tasks.XCategoryView extends Backbone.View
  template: JST["backbone/templates/tasks/categories"]
  tagName: "option"
  
  initialize: () ->


    
  render: ->
    $(@el).html(@template(@model.toJSON() ))
    return this