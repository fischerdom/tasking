Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.IndexView extends Backbone.View
  template: JST["backbone/templates/tasks/index"]

  initialize: () ->
    @options.tasks.bind('reset', @addAll)

  addAll: () =>
    @options.tasks.each(@addOne)

  addOne: (task) =>
    view = new Tasking.Views.Tasks.TaskView({model : task})
    @$("ul").append(view.render().el)

  render: =>
    $(@el).html(@template(tasks: @options.tasks.toJSON() ))
    @addAll()

    return this
    