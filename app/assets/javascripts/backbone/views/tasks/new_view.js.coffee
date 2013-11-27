Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.NewView extends Backbone.View
  template: JST["backbone/templates/tasks/new"]

  events:
    "submit #new-task": "save"

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
      success: (task) =>
        @model = task
        window.location.hash = "/#{@model.id}"

      error: (task, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )
    
   addAllTasklists: () =>
     @collectionTasklist = new Tasking.Collections.TasklistsCollection()
     @collectionTasklist.fetch({success :@addAllTasklistsAfterFetch})
  
  addAllTasklistsAfterFetch: () =>
    console.log(@collectionTasklist)
    @collectionTasklist.each(@addOneTasklist)

  addOneTasklist: (tasklist) =>
    view = new Tasking.Views.Tasks.TasklistsView({model : tasklist})
    @$("#select-tasklists").append(view.render().el)

  render: ->
    $(@el).html(@template(@model.toJSON() ))
    @addAllTasklists()
    this.$("form").backboneLink(@model)
    $("#app").trigger("create");

    return this
