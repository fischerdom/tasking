Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.GetView extends Backbone.View
  template: JST["backbone/templates/tasks/get"]

  initialize: () ->
    @UT = @options.tasks
    #@options.users.bind('reset', @addAll)

  addAll: () =>
    if(@UT.length > 0)
      @UT.each(@addOne)
    else
      @$("ul#UT").append("<li>No open Tasks found</li>")
    #@$("ol").listview('refresh');

  addOne: (ut) =>
    #@$("ol#UT").append("<li>" + ut.attributes.name + " " + rbp.attributes.points + "</li>")
    view = new Tasking.Views.Tasklists.TasklistDetailTaskView({task : ut})
    @$("ul").append(view.render().el)

  render: =>
    $(@el).html(@template)
    @addAll()
    
    return this
