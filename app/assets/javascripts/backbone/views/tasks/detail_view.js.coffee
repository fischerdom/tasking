Tasking.Views.Tasks ||= {}

# View for showing the Task history
class Tasking.Views.Tasks.DetailView extends Backbone.View
  template: JST["backbone/templates/tasks/detail"]

  m = 0
  
  # Loads friends and current_user
  initialize: (options) ->
    window.nr = 0
    @users = window.current_user.attributes.friends
    if (m == 0)
      @users.push window.current_user.attributes
      m = 1

  # Renders all users
  addAll: () =>
    for obj in window.current_user.attributes.friends
       @addOne(obj)
       window.nr = window.nr + 1

  # Renders one user
  # @param [User] user user model object
  addOne: (user) =>
    view = new Tasking.Views.Tasks.HistoryView({model : user})
    @$("#history-cont").append(view.render().el)

  # Renders template and adds all
  render: =>
    $(@el).html(@template())
    @addAll()

    return this
    