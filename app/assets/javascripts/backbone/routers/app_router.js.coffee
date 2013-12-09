class Tasking.Routers.AppRouter extends Backbone.Router
  initialize: (options) ->
    @currentUserInitialize();
    #@categoriesInitialize(options);
    #@statusesInitialize(options);
    @tasksInitialize();
    @tasklistsInitialize();
    #@usersInitialize(options);
    

  routes:
    "start"                 : "start"
    ".*"                    : "start"
    "login"                 : "login"
    "logout"                : "logout"
    "close"                 : "close"
    
    "users/ranking"         : "usersRanking"
    
    "tasks/new"             : "tasksNew"
    "tasks/get"             : "tasksGet"
    "tasks/get/:id"         : "tasksGetShow"
    "tasks/index"           : "tasksIndex"
    "tasks/:id/edit"        : "tasksEdit"
    "tasks/:id"             : "tasksShow"
    "tasks.*"               : "tasksIndex"
    
    "tasklists/detail"      : "tasklistsDetail"
    "tasklists/new"         : "tasklistsNew"
    "tasklists/index"       : "tasklistsIndex"
    "tasklists/:id/destroy" : "tasklistsDestroy"
    "tasklists/:id/edit"    : "tasklistsEdit"
    "tasklists.*"           : "tasklistsIndex"

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
    CU = new Tasking.Models.CurrentUser();
    window.current_user = CU;
    # async = false //Er soll warten bis er fertig ist.
    CU.fetch({async:false});
  
  usersRanking: (options) ->
    @view = new Tasking.Views.Users.RankingView()
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
     

  tasksInitialize: (options) ->
    @tasks = new Tasking.Collections.TasksCollection()
    @tasks.fetch({async: false})
    
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

  tasksGetShow: (id) ->
    task = @tasks.get(id)
    @view = new Tasking.Views.Tasks.GetShowView(model: task)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
    
  tasksGet: (id) ->
    @getTasks = new Tasking.Collections.TasksCollection()
    @getTasks.url = "tasks/get"
    @getTasks.fetch({async: false})
    @view = new Tasking.Views.Tasks.GetView(tasks: @getTasks)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  tasksEdit: (id) ->
    task = @tasks.get(id)
    @view = new Tasking.Views.Tasks.EditView(model: task)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
  
  
 
  tasklistsInitialize: ->
    @tasklists = new Tasking.Collections.TasklistsCollection()
    @tasklists.fetch({async: false})

  tasklistsNew: ->
    @view = new Tasking.Views.Tasklists.NewView(collection: @tasklists)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  tasklistsDetail: ->
    @view = new Tasking.Views.Tasklists.DetailView(tasklists: @tasklists)
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
    
  tasklistsDestroy: (id) ->
    tasklist = @tasklists.get(id)
    tasklist.destroy()
    
    @view = new Tasking.Views.Tasklists.IndexView(tasklists: @tasklists, msg: tasklist.name + " deleted!")
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
  
  
    
  