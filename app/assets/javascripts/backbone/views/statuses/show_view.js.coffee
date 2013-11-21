Tasking.Views.Statuses ||= {}

class Tasking.Views.Statuses.ShowView extends Backbone.View
  template: JST["backbone/templates/statuses/show"]

  render: ->
    $(@el).html(@template(@model.toJSON() ))
    return this
