Tasking.Views.Users ||= {}

class Tasking.Views.Users.ShowView extends Backbone.View
  template: JST["backbone/templates/users/show"]
  
  addAllFriends: () =>
    for obj in @model.attributes.friends
      @addOneFriend(obj)
    

  addOneFriend: (friend) =>
    view = new Tasking.Views.Users.FriendsView({model : friend})
    @$("ul").append(view.render().el)

  render: ->
    @$el.html(@template(@model.toJSON() )) 
    @addAllFriends()
    return this
    
