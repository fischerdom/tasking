Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.IndexView extends Backbone.View
  template: JST["backbone/templates/tasks/index"]

  initialize: () ->
    @options.tasks.bind('reset', @addAll)

  addAll: () =>
    @options.tasks.each(@addOne)
    if $(@el).find("li").size() == 0
      $(@el).find("ul").before("<p><b>Not open task found!</b></p>")

  addOne: (task) =>
    if (task.attributes.tasklist.closed != 1 and task.attributes.assigned_to == window.current_user.id and task.attributes.status_id != 3) 
      view = new Tasking.Views.Tasks.TaskView({model : task})
      @$("ul").append(view.render().el)
    
  render: =>
    $(@el).html(@template(tasks: @options.tasks.toJSON() ))
    @addAll()

    return this
    