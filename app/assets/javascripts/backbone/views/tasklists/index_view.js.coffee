Tasking.Views.Tasklists ||= {}

class Tasking.Views.Tasklists.IndexView extends Backbone.View
  template: JST["backbone/templates/tasklists/index"]

  initialize: () ->
    @options.tasklists.bind('reset', @addAll)

  addAll: () =>
    @options.tasklists.each(@addOne)

  addOne: (tasklist) =>
    view = new Tasking.Views.Tasklists.TasklistView({model : tasklist})
    @$("ul").append(view.render().el)

  render: =>
    $(@el).html(@template(tasklists: @options.tasklists.toJSON() ))
    @addAll()

    return this
    