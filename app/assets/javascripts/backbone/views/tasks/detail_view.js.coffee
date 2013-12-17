Tasking.Views.Tasks ||= {}

# View for showing the Task history
class Tasking.Views.Tasks.DetailView extends Backbone.View
  template: JST["backbone/templates/tasks/detail"]

  
  # Loads friends and current_user
  initialize: (options) ->
    @users = window.current_user.attributes.friends

  # Renders all users
  addAll: () =>
    @addOne(window.current_user.attributes)
    for obj in window.current_user.attributes.friends
       @addOne(obj)

  # Renders one user
  # @param [User] user user model object
  addOne: (user) =>
    view = new Tasking.Views.Tasks.HistoryView(user : user)
    @$("#history-cont").append(view.render().el)

  # Renders template and adds all
  render: =>
    $(@el).html(@template())
    @addAll()

    return this
    