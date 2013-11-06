Tasking.Views.Statuses ||= {}

class Tasking.Views.Statuses.IndexView extends Backbone.View
  template: JST["backbone/templates/statuses/index"]

  initialize: () ->
    @options.statuses.bind('reset', @addAll)

  addAll: () =>
    @options.statuses.each(@addOne)

  addOne: (status) =>
    view = new Tasking.Views.Statuses.StatusView({model : status})
    @$("ul").append(view.render().el)

  render: =>
    $(@el).html(@template(statuses: @options.statuses.toJSON() ))
    @addAll()

    return this
