Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.HistoryView extends Backbone.View
  template: JST["backbone/templates/tasks/history"]
  

  initialize: (options) ->
    @user = window.current_user.attributes.friends
    @nr = window.nr
    
  addAll: () =>
    if(@tasks.length > 0)
      @tasks.each(@addOne)
      
    else
      @$("ul").append("<li> No Task found</li>")
    @$("ul").listview('refresh');

  addOne: (task) =>
    if (task.attributes.assigned_to == @user[@nr].id and task.attributes.status_id == 3)
      view = new Tasking.Views.Tasks.HistoryTaskView({task : task})
      @$("ul").append(view.render().el)
    

  render: =>
    @tasks = new Tasking.Collections.TasksCollection()
    @tasks.fetch(data: {assigned_to : @user[@nr].id}, success: @addAll, async: true)
    

    $(@el).html(@template())
    $(@el).attr("data-role", "collapsible")
    $(@el).attr("data-theme", "b")
    $(@el).attr("data-content-theme", "c")

    return this