Tasking.Views.Tasklists ||= {}

class Tasking.Views.Tasklists.TasklistDetailTaskView extends Backbone.View
  template: JST["backbone/templates/tasklists/tasklist_detail_task"]
  tagName: "li"

  initialize: (options) ->
    @task = options.task

  render: =>
    console.log(@task.toJSON())
    $(@el).html(@template(@task.toJSON() ))

    return this
    