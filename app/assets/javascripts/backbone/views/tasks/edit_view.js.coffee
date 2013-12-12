Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.EditView extends Backbone.View
  template : JST["backbone/templates/tasks/edit"]

  events :
    "submit #edit-task" : "update"
    #"change #select-friend"   : "friendChange"
    #"change #select-status"   : "statusChange"
    #"change #select-category" : "categoryChange"
    
  update : (e) ->
    @model.attributes.due_date = $("#select-due_date").val();
    if (@model.attributes.due_date == "")
      @model.attributes.due_date = @pre_due_date
    
    @model.attributes.status_id = $("#select-status").val();
    @model.attributes.category_id = $("#select-category").val();
    @model.attributes.user_id = $("#select-friend").val();
    @model.attributes.pointvalue = $("#select-pointvalue").val();
    @model.attributes.etc = $("#select-etc").val();
    
    e.preventDefault()
    e.stopPropagation()
    
    @model.save(null,
      success : (task) =>
        @model = task
        window.location.hash = "tasks"
    )
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
    #Belege 
    @pre_due_date = @model.attributes.due_date
    @addAllFriends()
    @addAllCategories()
    @addAllStatuses()
    this.$("form").backboneLink(@model)

    return this
