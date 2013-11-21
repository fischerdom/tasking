class Tasking.Routers.AppRouter extends Backbone.Router
  initialize: (options) ->
    @tasklistsInitialize(options);

  routes:
    "start"              : "start"
    ".*"                 : "start"
    "tasklists/new"      : "tasklistsNew"
    "tasklists/index"    : "tasklistsIndex"
    "tasklists/:id/edit" : "tasklistsEdit"
    "tasklists/:id"      : "tasklistsShow"
    "tasklists*"         : "tasklistsIndex"

  start: ->
    @view = new Tasking.Views.Static.StartView()
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
    
  tasklistsInitialize: (options) ->
    @tasklists = new Tasking.Collections.TasklistsCollection()
    @tasklists.reset options.tasklists

  tasklistsNew: ->

    @view = new Tasking.Views.Tasklists.NewView(collection: @tasklists)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  tasklistsIndex: ->
    @view = new Tasking.Views.Tasklists.IndexView(tasklists: @tasklists)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  tasklistsShow: (id) ->
    tasklist = @tasklists.get(id)

    @view = new Tasking.Views.Tasklists.ShowView(model: tasklist)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  tasklistsEdit: (id) ->
    tasklist = @tasklists.get(id)

    @view = new Tasking.Views.Tasklists.EditView(model: tasklist)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')