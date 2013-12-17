Tasking.Views.Tasks ||= {}

# View to render the get task operation
class Tasking.Views.Tasks.GetView extends Backbone.View
  template: JST["backbone/templates/tasks/index"]

  # Initializer (binds events)
  initialize: () ->
    @options.tasks.bind('reset', @addAll)

  # Adds all open tasks to List
  addAll: () =>
    if @options.tasks.length == 0
      $(@el).find("ul").before("<p><b>No open tasks found!</b></p>")
    else
      @options.tasks.each(@addOne)

  # Renders one task
  # @param task task model object to render
  addOne: (task) =>
    view = new Tasking.Views.Tasks.GetTaskView({model : task})
    @$("ul").append(view.render().el)
  
  # Renders template  
  render: =>
    $(@el).html(@template(tasks: @options.tasks.toJSON() ))
    @addAll()

    return this
    