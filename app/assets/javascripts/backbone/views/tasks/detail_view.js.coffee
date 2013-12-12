Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.DetailView extends Backbone.View
  template: JST["backbone/templates/tasks/detail"]

  m = 0
  initialize: (options) ->
    window.nr = 0
    @users = window.current_user.attributes.friends
    if (m == 0)
      @users.push window.current_user.attributes
      m = 1

  addAll: () =>
    for obj in window.current_user.attributes.friends
       @addOne(obj)
       window.nr = window.nr + 1

  addOne: (user) =>
    view = new Tasking.Views.Tasks.HistoryView({model : user})
    @$("#history-cont").append(view.render().el)

  render: =>
    $(@el).html(@template())
    @addAll()

    return this
    