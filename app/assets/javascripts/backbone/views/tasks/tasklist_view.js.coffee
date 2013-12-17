Tasking.Views.Tasklists ||= {}

# View to show a Tasklist in a select box
class Tasking.Views.Tasks.TasklistsView extends Backbone.View
  template: JST["backbone/templates/tasks/tasklists"]
  tagName: "option"
  
  # Renders the template  
  render: ->
    $(@el).attr("value", @model.attributes.id)
    $(@el).html(@template(@model.toJSON() ))
    return this