Tasking.Views.XStatuses ||= {}

class Tasking.Views.Tasks.XStatusView extends Backbone.View
  template: JST["backbone/templates/tasks/statuses"]
  tagName: "option"
  
  initialize: () ->
    
    
  render: ->
    $(@el).attr("value", @model.attributes.id)
    $(@el).html(@template(@model.toJSON() ))
    return this