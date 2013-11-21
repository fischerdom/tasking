Tasking.Views.Statuses ||= {}

class Tasking.Views.Statuses.NewView extends Backbone.View
  template: JST["backbone/templates/statuses/new"]

  events:
    "submit #new-status": "save"

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
      success: (status) =>
        @model = status
        #window.location.hash = "/#{@model.id}"
        window.location.hash = ""
        
      error: (status, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )

  render: ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
