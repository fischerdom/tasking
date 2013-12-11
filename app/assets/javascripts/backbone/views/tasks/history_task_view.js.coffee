Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.HistoryTaskView extends Backbone.View
  template: JST["backbone/templates/tasks/history_task"]
  tagName: "li"

  initialize: (options) ->
    @task = options.task

  render: =>
    $(@el).html(@template(@task.toJSON() ))

    return this