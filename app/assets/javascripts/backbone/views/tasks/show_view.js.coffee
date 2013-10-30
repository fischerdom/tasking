Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.ShowView extends Backbone.View
  template: JST["backbone/templates/tasks/show"]

  render: ->
    $(@el).html(@template(@model.toJSON() ))
    $("#app").trigger("create");
    return this
