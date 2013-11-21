Tasking.Views.Tasklists ||= {}

class Tasking.Views.Tasklists.TasklistView extends Backbone.View
  template: JST["backbone/templates/tasklists/tasklist"]

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
