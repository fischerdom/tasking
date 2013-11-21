Tasking.Views.Static ||= {}

class Tasking.Views.Static.StartView extends Backbone.View
  template: JST["backbone/templates/static/start"]

  initialize: () ->

  render: =>
    $(@el).html(@template)

    return this
