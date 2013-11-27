Tasking.Views.Friends ||= {}

class Tasking.Views.Tasks.FriendsView extends Backbone.View
  template: JST["backbone/templates/tasks/friends"]
  tagName: "option"
  
  initialize: () ->
   # @model.friends.bind('reset', @addAllFriends)


    
  render: ->
    $(@el).html(@template(@model))
    return this