class Tasking.Routers.TasksRouter extends Backbone.Router
  initialize: (options) ->
    @tasks = new Tasking.Collections.TasksCollection()
    @tasks.reset options.tasks

  routes:
    "new"      : "newTask"
    "index"    : "index"
    ":id/edit" : "edit"
    ":id"      : "show"
    ".*"        : "index"

  newTask: ->
    @view = new Tasking.Views.Tasks.NewView(collection: @tasks)
    $("#tasks").html(@view.render().el).trigger('create')

  index: ->
    @view = new Tasking.Views.Tasks.IndexView(tasks: @tasks)
    $("#tasks").html(@view.render().el).trigger('create')

  show: (id) ->
    task = @tasks.get(id)

    @view = new Tasking.Views.Tasks.ShowView(model: task)
    $("#tasks").html(@view.render().el).trigger('create')

  edit: (id) ->
    task = @tasks.get(id)

    @view = new Tasking.Views.Tasks.EditView(model: task)
    $("#tasks").html(@view.render().el).trigger('create')
