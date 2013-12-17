Tasking.Views.Tasks ||= {}

# View to render the History
class Tasking.Views.Tasks.HistoryTaskView extends Backbone.View
  template: JST["backbone/templates/tasks/history_task"]
  tagName: "li"

  # Initializer to set options
  # @option task Task-Object to render
  initialize: (options) ->
    @task = options.task

  # Render the template
  render: =>
    $(@el).html(@template(@task.toJSON() ))

    return this