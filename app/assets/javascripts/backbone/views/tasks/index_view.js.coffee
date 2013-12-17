Tasking.Views.Tasks ||= {}

# View to render the not finished tasks
class Tasking.Views.Tasks.IndexView extends Backbone.View
  template: JST["backbone/templates/tasks/index"]

  # Initializer binds events
  initialize: () ->
    @options.tasks.bind('reset', @addAll)

  # renders all tasks for list
  addAll: () =>
    @options.tasks.each(@addOne)
    if $(@el).find("li").size() == 0
      $(@el).find("ul").before("<p><b>Not open task found!</b></p>")

  # renders on task if not closed
  # @param task task model object to render
  addOne: (task) =>
    if (task.attributes.tasklist.closed != 1 and task.attributes.assigned_to == window.current_user.id and task.attributes.status_id != 3) 
      view = new Tasking.Views.Tasks.TaskView({model : task})
      @$("ul").append(view.render().el)
  
  # renders the template
  render: =>
    $(@el).html(@template(tasks: @options.tasks.toJSON() ))
    @addAll()

    return this
    