class Tasking.Routers.AppRouter extends Backbone.Router
  initialize: (options) ->
    @categoriesInitialize(options);
    @statusesInitialize(options);
    @tasksInitialize(options);
    @tasklistsInitialize(options);
    @usersInitialize(options);
    @currentUserInitialize(options);

  routes:
    "start"                 : "start"
    ".*"                    : "start"
    "login"                 : "login"
    "logout"                : "logout"
    "close"                 : "close"
    "categories/new"        : "categoriesNew"
    "categories/index"      : "categoriesIndex"
    "categories/:id/edit"   : "categoriesEdit"
    "categories/:id/destroy": "categoriesDestroy"
    "categories/:id"        : "categoriesShow"
    "categories.*"           : "categoriesIndex"
    "statuses/new"          : "statusesNew"
    "statuses/index"        : "statusesIndex"
    "statuses/:id/edit"     : "statusesEdit"
    "statuses/:id"          : "statusesShow"
    "statuses.*"             : "statusesIndex"
    "tasks/new"             : "tasksNew"
    "tasks/index"           : "tasksIndex"
    "tasks/:id/edit"        : "tasksEdit"
    "tasks/:id"             : "tasksShow"
    "tasks.*"                : "tasksIndex"
    "tasklists/new"         : "tasklistsNew"
    "tasklists/index"       : "tasklistsIndex"
    "tasklists/:id/edit"    : "tasklistsEdit"
    "tasklists/:id"         : "tasklistsShow"
    "tasklists.*"            : "tasklistsIndex"
    "users.*"                : "usersIndex"
    "users/index"           : "usersIndex"
    "users/:id"             : "usersShow"

  start: ->
    @view = new Tasking.Views.Static.StartView()
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
  
  login: ->
    window.open("/auth/facebook")
    
    
  logout: ->
    window.open("/signout")
    
  close: ->
    opener.location.hash = ""
    opener.location.reload();
    window.close()
  
  currentUserInitialize: (options) ->
    @current_user = new Tasking.Models.User( options.current_user )
    
      
  categoriesInitialize: (options) ->
    @categories = new Tasking.Collections.CategoriesCollection()
    @categories.reset options.categories 
  
  categoriesNew: ->
    @view = new Tasking.Views.Categories.NewView(collection: @categories)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  categoriesIndex: ->
    @view = new Tasking.Views.Categories.IndexView(categories: @categories)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
    
  categoriesShow: (id) ->
    category = @categories.get(id)

    @view = new Tasking.Views.Categories.ShowView(model: category)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  categoriesEdit: (id) ->
    category = @categories.get(id)

    @view = new Tasking.Views.Categories.EditView(model: category)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
    
  categoriesDestroy: (id) ->
    category = @categories.get(id)
  
  statusesInitialize: (options) ->
    @statuses = new Tasking.Collections.StatusesCollection()
    @statuses.reset options.statuses 
    
  statusesNew: ->
    @view = new Tasking.Views.Statuses.NewView(collection: @statuses)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  statusesIndex: ->
    @view = new Tasking.Views.Statuses.IndexView(statuses: @statuses)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  statusesShow: (id) ->
    status = @statuses.get(id)

    @view = new Tasking.Views.Statuses.ShowView(model: status)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  statusesEdit: (id) ->
    status = @statuses.get(id)

    @view = new Tasking.Views.Statuses.EditView(model: status)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')      

  tasksInitialize: (options) ->
    @tasks = new Tasking.Collections.TasksCollection()
    @tasks.reset options.tasks  
    
  tasksNew: ->
    @view = new Tasking.Views.Tasks.NewView(collection: @tasks)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  tasksIndex: ->
    @view = new Tasking.Views.Tasks.IndexView(tasks: @tasks)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  tasksShow: (id) ->
    task = @tasks.get(id)

    @view = new Tasking.Views.Tasks.ShowView(model: task)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  tasksEdit: (id) ->
    task = @tasks.get(id)

    @view = new Tasking.Views.Tasks.EditView(model: task)
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
    
  