Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.EditView extends Backbone.View
  template : JST["backbone/templates/tasks/edit"]

  events :
    "submit #edit-task" : "update"

  update : (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.save(null,
      success : (task) =>
        @model = task
        window.location.hash = "/#{@model.id}"
    )
    
  addAllFriends: () =>
     for obj in window.router.current_user.attributes.friends
       @addOneFriend(obj)

  addOneFriend: (friend) =>
    view = new Tasking.Views.Tasks.FriendsView({model : friend})
    @$("#select-friends").append(view.render().el)

  render : ->
    $(@el).html(@template(@model.toJSON() ))
    @addAllFriends()
    this.$("form").backboneLink(@model)
    
    $("#app").trigger("create");

    return this
