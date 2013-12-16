Tasking.Views.Tasklists ||= {}


# View for detail tasklist
# Shows all tasklists with complete-rate and tasks
class Tasking.Views.Tasklists.DetailView extends Backbone.View
  template: JST["backbone/templates/tasklists/detail"]

  # Loads tasklists
  initialize: (options) ->
    @tasklists = options.tasklists
    @tasklists.bind('reset', @addAll)

  # Renders the tasklists
  addAll: () =>
    @tasklists.each(@addOne)

  # Renders a single tasklist
  # @param [Tasklist] tasklist a tasklist object
  addOne: (tasklist) =>
    view = new Tasking.Views.Tasklists.TasklistDetailView({model : tasklist})
    @$("#tasklist-cont").append(view.render().el)

  # Renders the template
  render: =>
    $(@el).html(@template(tasklists: @tasklists.toJSON() ))
    @addAll()

    return this
    