Tasking.Views.Tasklists ||= {}

class Tasking.Views.Tasklists.IndexView extends Backbone.View
  template: JST["backbone/templates/tasklists/index"]

  initialize: (options) ->
    @tasklists = options.tasklists
    @tasklists.bind('reset', @addAll)

  addAll: () =>
    @tasklists.each(@addOne)

  addOne: (tasklist) =>
    view = new Tasking.Views.Tasklists.TasklistView({model : tasklist})
    @$("ul").append(view.render().el)

  render: =>
    $(@el).html(@template(tasklists: @tasklists.toJSON() ))
    @addAll()

    return this
    