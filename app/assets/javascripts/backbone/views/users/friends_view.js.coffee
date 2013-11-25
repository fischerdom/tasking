Tasking.Views.Friends ||= {}

class Tasking.Views.Users.FriendsView extends Backbone.View
  template: JST["backbone/templates/users/friends"]
  
  initialize: () ->
   # @model.friends.bind('reset', @addAllFriends)


    
  render: ->
    @$el.html(@template(@model))
    return this