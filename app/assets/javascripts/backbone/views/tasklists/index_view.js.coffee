Tasking.Views.Tasklists ||= {}

# View to list all tasklists (simple)
class Tasking.Views.Tasklists.IndexView extends Backbone.View
  template: JST["backbone/templates/tasklists/index"]

  # loads the task
  initialize: (options) ->
    @tasklists = options.tasklists
    @tasklists.bind('reset', @addAll)

  # renders all tasks
  addAll: () =>
    @tasklists.each(@addOne)

  # renders one task
  # @param [Tasklist] tasklist tasklist model objedt
  addOne: (tasklist) =>
    view = new Tasking.Views.Tasklists.TasklistView({model : tasklist})
    @$("ul").append(view.render().el)

  # renders the template and adds all tasklists
  render: =>
    $(@el).html(@template(tasklists: @tasklists.toJSON() ))
    @addAll()

    return this
    