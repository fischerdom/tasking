Tasking.Views.Tasklists ||= {}

class Tasking.Views.Tasklists.EditView extends Backbone.View
  template : JST["backbone/templates/tasklists/edit"]

  events :
    "submit #edit-tasklist" : "update"

  update : (e) ->
    @model.attributes.closed = $("#select-closed").val();
    e.preventDefault()
    e.stopPropagation()
    @model.save(null,
      success : (tasklist) =>
        @model = tasklist
        window.location.hash = "tasklists"
    )

  render : ->
    $(@el).html(@template(@model.toJSON() ))
    this.$("form").backboneLink(@model)

    return this
