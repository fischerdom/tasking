Tasking.Views.Tasklists ||= {}

class Tasking.Views.Tasklists.TasklistDetailView extends Backbone.View
  template: JST["backbone/templates/tasklists/tasklist_detail"]


  initialize: (options) ->
    @tasklist = options.model

  addAll: () =>
    if(@tasklist.attributes.closed == 0)
      @$("ul").append("<li><a href='#/tasks/new' align='center'> New Task </a></li>")
      
    if(@tasks.length > 0)
      @tasks.each(@addOne)
    else
      @$("ul").append("<li> No Task found</li>")
    @$("ul").listview('refresh');

  addOne: (task) =>
    view = new Tasking.Views.Tasklists.TasklistDetailTaskView({task : task})
    @$("ul").append(view.render().el)
    

  render: =>
    @tasks = new Tasking.Collections.TasksCollection()
    @tasks.fetch(data: {tasklist_id : @tasklist.attributes.id}, success: @addAll, async: true)
    
    $(@el).html(@template(@tasklist.toJSON() ))
    $(@el).attr("data-role", "collapsible")
    $(@el).attr("data-theme", "b")
    $(@el).attr("data-content-theme", "c")

    return this
    