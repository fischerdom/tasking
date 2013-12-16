#
# Global router class 
# @abstract Responsible for navigating client-side

class Tasking.Routers.AppRouter extends Backbone.Router
  # Fetches current_user, tasks and tasklists for further use
  initialize: (options) ->
    @currentUserInitialize();
    @tasksInitialize();
    @tasklistsInitialize();
    
  # Initialisierung der Routen nach dem Hashtag
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
    "tasks/history"         : "tasksHistory"
    "tasks/:id/destroy"     : "tasksDestroy"
    "tasks/:id/edit"        : "tasksEdit"
    "tasks/:id"             : "tasksShow"
    "tasks.*"               : "tasksIndex"
    
    "tasklists/detail"      : "tasklistsDetail"
    "tasklists/new"         : "tasklistsNew"
    "tasklists/index"       : "tasklistsIndex"
    "tasklists/:id/destroy" : "tasklistsDestroy"
    "tasklists/:id/edit"    : "tasklistsEdit"
    "tasklists.*"           : "tasklistsIndex"


# Definition der Routen
  #Routes to start-page
  start: ->
    @view = new Tasking.Views.Static.StartView()
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
  
  # Opens login page in a new window
  login: ->
    window.open("/auth/facebook")
    
  # Opens logout page in a new window
  logout: ->
    window.open("/signout")
  
  # Closes the actual window and reloads the opener  
  close: ->
    opener.location.hash = ""
    opener.location.reload();
    window.close()
  
  # Retrieves the current_user 
  # @example How to access the current_user
  #   alert(window.current_user.attributes.name)
  currentUserInitialize: (options) ->
    CU = new Tasking.Models.CurrentUser();
    window.current_user = CU;
    CU.fetch({async:false});
  
  # Links to the page where the user rating will be shown
  usersRanking: (options) ->
    @view = new Tasking.Views.Users.RankingView()
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
     
  # Retrieves all tasks, the user can see
  tasksInitialize: (options) ->
    @tasks = new Tasking.Collections.TasksCollection()
    @tasks.fetch({async: false})
  
  # Opens the task create view  
  tasksNew: ->
    @view = new Tasking.Views.Tasks.NewView(collection: @tasks)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  # Lists all the open Tasks
  tasksIndex: ->
    @tasksInitialize();
    @view = new Tasking.Views.Tasks.IndexView(tasks: @tasks)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
  
  # Navigates the history with all closed tasks
  tasksHistory: ->
    @tasksInitialize();
    @view = new Tasking.Views.Tasks.DetailView(tasks: @tasks)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  # Shows a single task by id
  # @param [Integer] id task_id in database
  tasksShow: (id) ->
    task = @tasks.get(id)
    @view = new Tasking.Views.Tasks.ShowView(model: task)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  # Open View to get a unassigned task
  # @param [Integer] id task_id in database
  tasksGetShow: (id) ->
    task = @tasks.get(id)
    @view = new Tasking.Views.Tasks.GetShowView(model: task)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
  
  # Open view to get a new, open, unassigned task
  tasksGet: ->
    @getTasks = new Tasking.Collections.TasksCollection()
    @getTasks.url = "tasks/get"
    @getTasks.fetch({async: false})
    @view = new Tasking.Views.Tasks.GetView(tasks: @getTasks)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
  
  # Open View to edit a task
  # @param [Integer] id task_id in database
  tasksEdit: (id) ->
    task = @tasks.get(id)
    @view = new Tasking.Views.Tasks.EditView(model: task)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
    
  # Deletes a task
  # @param [Integer] id task_id in database
  tasksDestroy: (id) ->
    task = @tasks.get(id)
    task.destroy()
    
    @view = new Tasking.Views.Tasks.IndexView(tasks: @tasks, msg: task.name + " deleted!")
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
  
  # fetches all the tasklists of the current user
  tasklistsInitialize: ->
    @tasklists = new Tasking.Collections.TasklistsCollection()
    @tasklists.fetch({async: false})

  # Open View to create a tasklist
  tasklistsNew: ->
    @view = new Tasking.Views.Tasklists.NewView(collection: @tasklists)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  # Open View with the tasklists of the current user and all his tasks
  tasklistsDetail: ->
    @view = new Tasking.Views.Tasklists.DetailView(tasklists: @tasklists)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  # Lists all the tasklists
  tasklistsIndex: ->
    @view = new Tasking.Views.Tasklists.IndexView(tasklists: @tasklists)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
  
  # Shows a single tasklist by id
  # @param [Integer] id tasklist_id in database
  tasklistsShow: (id) ->
    tasklist = @tasklists.get(id)

    @view = new Tasking.Views.Tasklists.ShowView(model: tasklist)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')

  # Opens a single tasklist to edit
  # @param [Integer] id tasklist_id in database
  tasklistsEdit: (id) ->
    tasklist = @tasklists.get(id)

    @view = new Tasking.Views.Tasklists.EditView(model: tasklist)
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
  
  # Deletes a single tasklist
  # @param [Integer] id tasklist_id in database  
  tasklistsDestroy: (id) ->
    tasklist = @tasklists.get(id)
    tasklist.destroy()
    
    @view = new Tasking.Views.Tasklists.IndexView(tasklists: @tasklists, msg: tasklist.name + " deleted!")
    $("#BBCont").html(@view.render().el).trigger('pagecreate')
  
  
    
  