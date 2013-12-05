Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.NewView extends Backbone.View
  template: JST["backbone/templates/tasks/new"]

  events:
    "submit #new-task": "save"
#   "change #select-tasklist" : "tasklistChange"
#   "change #select-category" : "categoryChange"
#   "change #select-friend"   : "friendChange"
#   "change #select-pointvalue"      : "pointvalueChange"
    
  constructor: (options) ->
    super(options)
    @model = new @collection.model()
 

    @model.bind("change:errors", () =>
      this.render()
    )

  save: (e) ->
    @model.attributes.tasklist_id = $("#select-tasklist").val();
    @model.attributes.category_id = $("#select-category").val();
    @model.attributes.user_id = $("#select-friend").val();
    @model.attributes.pointvalue = $("#select-pointvalue").val();
    @model.attributes.due_date = $("#select-due_date").val();
    @model.attributes.etc = $("#select-etc").val();    
    e.preventDefault()
    e.stopPropagation()
    
    @model.unset("errors")

    @collection.create(@model.toJSON(),
      success: (task) =>
        @model = task
        window.location.hash = "tasks"
        window.location.reload();

      error: (task, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )
    
#  tasklistChange: (tasklist_id) ->
#    tasklist_id = $("#select-tasklist").val(); 
    
#  categoryChange: (category_id) ->
#    category_id = $("#select-category").val(); 
    
#  friendChange: (user_id) ->
#    user_id = $("#select-friend").val();  
    
#  pointvalueChange: (pointvalue) -> 
#    pointvalue = $("select-pointvalue").val();
#    xpointvalue = $("#select-pointvalue").val();
#    pointvalue = xpointvalue
#    console.log(pointvalue)

      
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
    $("#app").trigger("create");
    this.$("form").backboneLink(@model)

    return this
