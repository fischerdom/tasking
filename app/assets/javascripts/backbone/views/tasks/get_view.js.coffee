Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.GetView extends Backbone.View
  template: JST["backbone/templates/tasks/index"]

  initialize: () ->
    @options.tasks.bind('reset', @addAll)

  addAll: () =>
    if @options.tasks.length == 0
      $(@el).find("ul").before("<p><b>No open tasks found!</b></p>")
    else
      @options.tasks.each(@addOne)

  addOne: (task) =>
    view = new Tasking.Views.Tasks.GetTaskView({model : task})
    @$("ul").append(view.render().el)
    
  render: =>
    $(@el).html(@template(tasks: @options.tasks.toJSON() ))
    @addAll()

    return this
    