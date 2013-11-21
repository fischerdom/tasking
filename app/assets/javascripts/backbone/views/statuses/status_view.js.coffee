Tasking.Views.Statuses ||= {}

class Tasking.Views.Statuses.StatusView extends Backbone.View
  template: JST["backbone/templates/statuses/status"]

  events:
    "click .destroy" : "destroy"

  tagName: "li"
  className: "ui-li"

  destroy: () ->
    @model.destroy()
    this.remove()

    return false

  render: ->
    $(@el).html(@template(@model.toJSON() ))
    return this
