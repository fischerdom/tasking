Tasking.Views.XStatuses ||= {}

# View to show a status in a select box
class Tasking.Views.Tasks.XStatusView extends Backbone.View
  template: JST["backbone/templates/tasks/statuses"]
  tagName: "option"
    
  # Renders the template
  render: ->
    $(@el).attr("value", @model.attributes.id)
    $(@el).html(@template(@model.toJSON() ))
    return this