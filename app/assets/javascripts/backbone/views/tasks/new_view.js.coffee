Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.NewView extends Backbone.View
  template: JST["backbone/templates/tasks/new"]

  events:
    "submit #new-task": "save"
    "change #select-tasklist" : "tasklistChange"
    "change #select-category" : "categoryChange"
    "change #select-friend"   : "friendChange"
    
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
    
  tasklistChange: (tasklist_id) ->
    tasklist_id = $("#select-tasklist").val(); 
    
  categoryChange: (category_id) ->
    category_id = $("#select-category").val(); 
    
  friendChange: (user_id) ->
    user_id = $("#select-friend").val();  
    
      
  addAllCategories: () =>
     @collectionCategory = new Tasking.Collections.CategoriesCollection()
     @collectionCategory.fetch({success :@addAllCategoriesAfterFetch})
      
  addAllCategoriesAfterFetch: () =>
    @collectionCategory.each(@addOneCategory)

  addOneCategory: (category) =>
    view = new Tasking.Views.Tasks.XCategoryView({model : category})
    @$("#select-category").append(view.render().el) 
    
  addAllFriends: () =>
     @addOneFriend(current_user.toJSON())
     for obj in window.current_user.attributes.friends
       @addOneFriend(obj)
       

  addOneFriend: (friend) =>
    view = new Tasking.Views.Tasks.FriendsView({model : friend})
    @$("#select-friend").append(view.render().el)    
    
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
    @addAllFriends()
    this.$("form").backboneLink(@model)
    $("#app").trigger("create");

    return this
