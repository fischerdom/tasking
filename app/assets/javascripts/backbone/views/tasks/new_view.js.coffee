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
        window.location.hash = "tasks/{@model.id}"

      error: (task, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )
    
  addAllCategories: () =>
     @collectionCategory = new Tasking.Collections.CategoriesCollection()
     @collectionCategory.fetch({success :@addAllCategoriesAfterFetch})
      
  addAllCategoriesAfterFetch: () =>
    @collectionCategory.each(@addOneCategory)

  addOneCategory: (category) =>
    view = new Tasking.Views.Tasks.XCategoryView({model : category})
    @$("#select-category").append(view.render().el)    
    
   addAllTasklists: () =>
     @collectionTasklist = new Tasking.Collections.TasklistsCollection()
     @collectionTasklist.fetch({success :@addAllTasklistsAfterFetch})
  
  addAllTasklistsAfterFetch: () =>
    @collectionTasklist.each(@addOneTasklist)

  addOneTasklist: (tasklist) =>
    view = new Tasking.Views.Tasks.TasklistsView({model : tasklist})
    @$("#select-tasklist").append(view.render().el)
    
   
  render: ->
    $(@el).html(@template(@model.toJSON() ))
    @addAllTasklists()
    @addAllCategories()
    this.$("form").backboneLink(@model)
    $("#app").trigger("create");

    return this
