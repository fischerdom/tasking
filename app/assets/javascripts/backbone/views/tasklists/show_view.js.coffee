Tasking.Views.Tasklists ||= {}

class Tasking.Views.Tasklists.ShowView extends Backbone.View
  template: JST["backbone/templates/tasklists/show"]

  render: ->
    $(@el).html(@template(@model.toJSON() ))

    return this
