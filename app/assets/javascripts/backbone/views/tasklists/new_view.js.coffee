Tasking.Views.Tasklists ||= {}

class Tasking.Views.Tasklists.NewView extends Backbone.View
  template: JST["backbone/templates/tasklists/new"]

  events:
    "submit #new-tasklist": "save"

  constructor: (options) ->
    super(options)
    @model = new @collection.model()

    @model.bind("change:errors", () =>
      this.render()
    )

  save: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")

    @collection.create(@model.toJSON(),
      success: (tasklist) =>
        @model = tasklist
        window.location.hash = "tasklists"
        window.location.reload();

      error: (tasklist, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )

  render: ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)
    $("#app").trigger("create");

    return this
