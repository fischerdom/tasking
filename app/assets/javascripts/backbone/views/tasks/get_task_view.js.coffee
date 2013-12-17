Tasking.Views.Tasks ||= {}

# View to render a task in "get task"
class Tasking.Views.Tasks.GetTaskView extends Backbone.View
  template: JST["backbone/templates/tasks/get_task"]

  events:
    "click .destroy" : "destroy"

  tagName: "li"
  
  className: "ui-li"

  # Deletes the actual model
  destroy: () ->
    @model.destroy()
    this.remove()

    return false

  # renders the template
  render: ->
    $(@el).html(@template(@model.toJSON() ))
    $("#app").trigger("create");
    return this
