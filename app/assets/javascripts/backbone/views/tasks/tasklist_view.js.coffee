Tasking.Views.Tasklists ||= {}

class Tasking.Views.Tasks.TasklistsView extends Backbone.View
  template: JST["backbone/templates/tasks/tasklists"]
  tagName: "option"
  
  initialize: () ->


    
  render: ->
    console.log(@el)
    $(@el).html(@template(@model.toJSON() ))
    return this