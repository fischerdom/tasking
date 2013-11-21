Tasking.Views.Statuses ||= {}

class Tasking.Views.Statuses.EditView extends Backbone.View
  template : JST["backbone/templates/statuses/edit"]

  events :
    "submit #edit-status" : "update"

  update : (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.save(null,
      success : (status) =>
        @model = status
        window.location.hash = "/#{@model.id}"
    )

  render : ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
