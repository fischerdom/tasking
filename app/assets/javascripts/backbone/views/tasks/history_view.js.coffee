Tasking.Views.Tasks ||= {}

# View for the History
class Tasking.Views.Tasks.HistoryView extends Backbone.View
  template: JST["backbone/templates/tasks/history"]
  
  # Initializer, sets the user
  initialize: (options) ->
    @user = options.user
   
  # Adds all History-Items to list 
  addAll: () =>
    if(@tasks.length > 0)
      @tasks.each(@addOne)
      
    else
      @$("ul").append("<li>Nothing found</li>")
    @$("ul").listview('refresh');

  # Renders one task
  # @task task object to render
  addOne: (task) =>
    if (task.attributes.assigned_to == @user.id and task.attributes.status_id == 3)
      view = new Tasking.Views.Tasks.HistoryTaskView({task : task})
      @$("ul").append(view.render().el)
    
  # Render the template and all the history tasks
  render: =>
    @tasks = new Tasking.Collections.TasksCollection()
    @tasks.fetch(data: {assigned_to : @user.id}, success: @addAll, async: true)
    
  
    $(@el).html(@template(@user))
    $(@el).attr("data-role", "collapsible")
    $(@el).attr("data-theme", "b")
    $(@el).attr("data-content-theme", "c")

    return this