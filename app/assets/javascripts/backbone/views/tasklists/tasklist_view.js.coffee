Tasking.Views.Tasklists ||= {}

# view to show a single tasklist
class Tasking.Views.Tasklists.TasklistView extends Backbone.View
  template: JST["backbone/templates/tasklists/tasklist"]

  events:
    "click .destroy" : "destroy"

  tagName: "li"
  
  className: "ui-li"

  # deletes the loaded tasklist model
  destroy: () ->
    @model.destroy()
    this.remove()

    return false

  # renders the template
  render: ->
    $(@el).html(@template(@model.toJSON() ))
    $("#app").trigger("create");
    return this
