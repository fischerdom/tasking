class Tasking.Routers.AppRouter extends Backbone.Router
  initialize: (options) ->
    @tasklistsInitialize(options);
    @usersInitialize(options);

  routes:
    "start"              : "start"
    ".*"                 : "start"
    "tasklists/new"      : "tasklistsNew"
    "tasklists/index"    : "tasklistsIndex"
    "tasklists/:id/edit" : "tasklistsEdit"
    "tasklists/:id"      : "tasklistsShow"
    "tasklists*"         : "tasklistsIndex"
    "users*"             : "usersIndex"
    "users/index"        : "usersIndex"
    "users/:id"          : "usersShow"

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
  
  usersInitialize: (options) ->
    @users = new Tasking.Collections.UsersCollection()
    @users.reset options.users
    
  usersIndex: ->
    @view = new Tasking.Views.Users.IndexView(users: @users)
    console.log(@view.render().el)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
    
  usersShow: (id) ->
    user = @users.get(id)

    @view = new Tasking.Views.Users.ShowView(model: user)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
  