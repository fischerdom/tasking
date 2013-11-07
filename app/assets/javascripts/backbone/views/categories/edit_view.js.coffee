Tasking.Views.Categories ||= {}

class Tasking.Views.Categories.EditView extends Backbone.View
  template : JST["backbone/templates/categories/edit"]

  events :
    "submit #edit-category" : "update"

  update : (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.save(null,
      success : (category) =>
        @model = category
        window.location.hash = "/#{@model.id}"
    )

  render : ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
