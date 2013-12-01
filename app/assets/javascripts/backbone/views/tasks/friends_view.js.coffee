Tasking.Views.Friends ||= {}

class Tasking.Views.Tasks.FriendsView extends Backbone.View
  template: JST["backbone/templates/tasks/friends"]
  tagName: "option"
  
  initialize: () ->


    
  render: ->
    $(@el).attr("value", @model.id)
    $(@el).html(@template(@model))
    return this