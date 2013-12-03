Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.EditView extends Backbone.View
  template : JST["backbone/templates/tasks/edit"]

  events :
    "submit #edit-task" : "update"
    "change #select-friend"   : "friendChange"
    "change #select-status"   : "statusChange"
    "change #select-category" : "categoryChange"
    
  update : (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.save(null,
      success : (task) =>
        @model = task
        window.location.hash = "tasks"
    )
    
    
  categoryChange: (category_id) ->
    category_id = $("#select-category").val(); 
    
  friendChange: (user_id) ->
    user_id = $("#select-friend").val();  
    
  statusChange: (status_id) ->
    status_id = $("#select-status").val();   
   
  addAllFriends: () =>
     @addOneFriend(current_user.toJSON())
     for obj in window.current_user.attributes.friends
       @addOneFriend(obj)

  addOneFriend: (friend) =>
    view = new Tasking.Views.Tasks.FriendsView({model : friend})
    @$("#select-friend").append(view.render().el)    
    
  addAllStatuses: () =>
    @collectionStatus = new Tasking.Collections.StatusesCollection()
    @collectionStatus.fetch({success :@addAllStatusesAfterFetch})
      
  addAllStatusesAfterFetch: () =>
    @collectionStatus.each(@addOneStatus)
    
  addOneStatus: (status) =>
    view = new Tasking.Views.Tasks.XStatusView({model : status})
    @$("#select-status").append(view.render().el) 
    
    
  addAllCategories: () =>
     @collectionCategory = new Tasking.Collections.CategoriesCollection()
     @collectionCategory.fetch({success :@addAllCategoriesAfterFetch})
      
  addAllCategoriesAfterFetch: () =>
    @collectionCategory.each(@addOneCategory)
    
  addOneCategory: (category) =>
    view = new Tasking.Views.Tasks.XCategoryView({model : category})
    @$("#select-category").append(view.render().el) 

  render : ->
    $(@el).html(@template(@model.toJSON() ))
    @addAllFriends()
    @addAllCategories()
    @addAllStatuses()
    this.$("form").backboneLink(@model)
    
    $("#app").trigger("create");

    return this
