Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.TaskView extends Backbone.View
  template: JST["backbone/templates/tasks/task"]

  events:
    "click .destroy" : "destroy"

  tagName: "li"
  
  className: "ui-li"

  destroy: () ->
    @model.destroy()
    this.remove()

    return false

  render: ->
    $(@el).html(@template(@model.toJSON() ))
    $("#app").trigger("create");
    return this
