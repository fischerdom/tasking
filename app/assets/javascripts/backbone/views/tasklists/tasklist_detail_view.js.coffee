Tasking.Views.Tasklists ||= {}

# Renders a single tasklist contained in the detail view
class Tasking.Views.Tasklists.TasklistDetailView extends Backbone.View
  template: JST["backbone/templates/tasklists/tasklist_detail"]

  # loads the tasklist in the view
  # @options model tasklist model object
  initialize: (options) ->
    @tasklist = options.model

  # adds all tasks in the template
  addAll: () =>
    if(@tasklist.attributes.closed == 0)
      @$("ul").append("<li><a href='#/tasks/new' align='center'> New Task </a></li>")
      
    if(@tasks.length > 0)
      @tasks.each(@addOne)
    else
      @$("ul").append("<li> No Task found</li>")
    @$("ul").listview('refresh');
  
  # renders one task
  # @param [Task] task task model object to render
  addOne: (task) =>
    view = new Tasking.Views.Tasklists.TasklistDetailTaskView({task : task})
    @$("ul").append(view.render().el)
    
  # render the template
  render: =>
    @tasks = new Tasking.Collections.TasksCollection()
    @tasks.fetch(data: {tasklist_id : @tasklist.attributes.id}, success: @addAll, async: true)
    
    $(@el).html(@template(@tasklist.toJSON() ))
    $(@el).attr("data-role", "collapsible")
    $(@el).attr("data-theme", "b")
    $(@el).attr("data-content-theme", "c")

    return this
    