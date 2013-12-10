Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.IndexView extends Backbone.View
  template: JST["backbone/templates/tasks/index"]

  initialize: () ->
    @options.tasks.bind('reset', @addAll)

  addAll: () =>
    @options.tasks.each(@addOne)

  addOne: (task) =>
    if (task.attributes.tasklist.closed != 1 and (task.attributes.assigned_to == window.current_user.id or task.attributes.tasklist.user_id == window.current_user.id) and task.attributes.status_id != 3) 
      view = new Tasking.Views.Tasks.TaskView({model : task})
      @$("ul").append(view.render().el)
    
  render: =>
    $(@el).html(@template(tasks: @options.tasks.toJSON() ))
    @addAll()

    return this
    