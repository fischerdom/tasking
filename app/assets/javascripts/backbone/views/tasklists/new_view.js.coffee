Tasking.Views.Tasklists ||= {}

# View to create a new tasklist
class Tasking.Views.Tasklists.NewView extends Backbone.View
  template: JST["backbone/templates/tasklists/new"]

  events:
    "submit #new-tasklist": "save"

  # Constructor to create a empty tasklist-object
  constructor: (options) ->
    super(options)
    @router = options.router
    @model = new @collection.model()

    @model.bind("change:errors", () =>
      this.render()
    )

  # Saves the tasklist by the values in the form
  save: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")

    @collection.create(@model.toJSON(),
      success: (tasklist) =>
        @model = tasklist
        @router.initialize()
        window.location.hash = "tasklists/index"

      error: (tasklist, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )


  # renders the tasklist
  render: ->
    $(@el).html(@template(@model.toJSON() ))    
    $("#app").trigger("create");
    this.$("form").backboneLink(@model)

    return this
