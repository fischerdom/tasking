Tasking.Views.Tasks ||= {}

# Shows a task in a ul list
class Tasking.Views.Tasks.TaskView extends Backbone.View
  template: JST["backbone/templates/tasks/task"]

  events:
    "click .destroy" : "destroy"

  tagName: "li"
  
  className: "ui-li"

  # Deletes the task
  destroy: () ->
    @model.destroy()
    this.remove()

    return false

  # Renders the template
  render: ->
    $(@el).html(@template(@model.toJSON() ))
    $("#app").trigger("create");
    return this
