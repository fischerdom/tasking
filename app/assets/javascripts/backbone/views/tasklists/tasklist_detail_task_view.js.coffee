Tasking.Views.Tasklists ||= {}

# Renders a single task contained in the tasklist-detail view
class Tasking.Views.Tasklists.TasklistDetailTaskView extends Backbone.View
  template: JST["backbone/templates/tasklists/tasklist_detail_task"]
  tagName: "li"

  # loads the task object in the view
  # @options task task object
  initialize: (options) ->
    @task = options.task

  # Renders the template
  render: =>
    $(@el).html(@template(@task.toJSON() ))

    return this
    