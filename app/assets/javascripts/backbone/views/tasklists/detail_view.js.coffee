Tasking.Views.Tasklists ||= {}

class Tasking.Views.Tasklists.DetailView extends Backbone.View
  template: JST["backbone/templates/tasklists/detail"]

  initialize: (options) ->
    @tasklists = options.tasklists
    @tasklists.bind('reset', @addAll)

  addAll: () =>
    @tasklists.each(@addOne)

  addOne: (tasklist) =>
    view = new Tasking.Views.Tasklists.TasklistDetailView({model : tasklist})
    @$("#tasklist-cont").append(view.render().el)

  render: =>
    $(@el).html(@template(tasklists: @tasklists.toJSON() ))
    @addAll()

    return this
    