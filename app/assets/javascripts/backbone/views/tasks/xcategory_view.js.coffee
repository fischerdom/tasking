Tasking.Views.XCategories ||= {}

class Tasking.Views.Tasks.XCategoryView extends Backbone.View
  template: JST["backbone/templates/tasks/categories"]
  tagName: "option"
  
  initialize: () ->


    
  render: ->
    $(@el).attr("value", @model.attributes.id)
    $(@el).html(@template(@model.toJSON() ))
    return this