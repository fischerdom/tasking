Tasking.Views.Tasklists ||= {}

class Tasking.Views.Tasklists.EditView extends Backbone.View
  template : JST["backbone/templates/tasklists/edit"]

  events :
    "submit #edit-tasklist" : "update"

  update : (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.save(null,
      success : (task) =>
        @model = task
        window.location.hash = "tasklists/{@model.id}"
    )

  render : ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
