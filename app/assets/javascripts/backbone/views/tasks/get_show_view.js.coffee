Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.GetShowView extends Backbone.View
  template: JST["backbone/templates/tasks/get_show"]

  events :
    "click #assign-task" : "assign"
    
  assign : (e) ->
    @model.attributes.assigned_to = window.current_user.id
    
    e.preventDefault()
    e.stopPropagation()
    
    @model.save(null,
      success : (task) =>
        @model = task
        window.location.hash = "tasks"
        window.location.reload();
    )

  render: ->
    
    $(@el).html(@template(@model.toJSON() ))
    $("#app").trigger("create");
    return this
