Tasking.Views.Tasklists ||= {}

# View to edit a tasklist
class Tasking.Views.Tasklists.EditView extends Backbone.View
  template : JST["backbone/templates/tasklists/edit"]

  events :
    "submit #edit-tasklist" : "update"

  # fired by the submit button, updates the task if valid
  update : (e) ->
    @model.attributes.closed = $("#select-closed").val();
    e.preventDefault()
    e.stopPropagation()
    @model.save(null,
      success : (tasklist) =>
        @model = tasklist
        window.location.hash = "tasklists"
    )
  
  # renders the template and links the form 
  render : ->
    $(@el).html(@template(@model.toJSON() ))
    this.$("form").backboneLink(@model)

    return this
