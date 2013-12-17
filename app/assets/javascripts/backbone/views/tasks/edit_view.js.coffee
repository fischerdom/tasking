Tasking.Views.Tasks ||= {}

# View to edit a single task
class Tasking.Views.Tasks.EditView extends Backbone.View
  template : JST["backbone/templates/tasks/edit"]

  events :
    "submit #edit-task" : "update"
  
  # Updates the taks model and sync with server
  # @param e Event data
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
    
  # Renders all friends for list
  addAllFriends: () =>
    if @model.attributes.assigned_to == null
      @$("#select-friend").append("<option selectd='selected'>not assigned</option>") 
    else
      @$("#select-friend").append("<option>not assigned</option>") 
     
    @addOneFriend(current_user.toJSON())
    for obj in window.current_user.attributes.friends
      @addOneFriend(obj)

  # Renders one friend in list
  addOneFriend: (friend) =>
    view = new Tasking.Views.Tasks.FriendsView({model : friend, selected : @model.attributes.assigned_to == friend.id})
    @$("#select-friend").append(view.render().el)    
   
  # Adds all statuses to list 
  addAllStatuses: () =>
    @collectionStatus = new Tasking.Collections.StatusesCollection()
    @collectionStatus.fetch({success :@addAllStatusesAfterFetch})
  
  # Method called after the data response
  addAllStatusesAfterFetch: () =>
    @collectionStatus.each(@addOneStatus)
  
  # Renders one status  
  addOneStatus: (status) =>
    view = new Tasking.Views.Tasks.XStatusView({model : status})
    @$("#select-status").append(view.render().el) 
    
  # Method to fetch all categories  
  addAllCategories: () =>
     @collectionCategory = new Tasking.Collections.CategoriesCollection()
     @collectionCategory.fetch({success :@addAllCategoriesAfterFetch})
  
  # Method called after the data response
  addAllCategoriesAfterFetch: () =>
    @collectionCategory.each(@addOneCategory)
   
  # Renders one category  
  addOneCategory: (category) =>
    view = new Tasking.Views.Tasks.XCategoryView({model : category})
    @$("#select-category").append(view.render().el) 

  # Renders template
  render : ->
    $(@el).html(@template(@model.toJSON() ))
    #Belege 
    @pre_due_date = @model.attributes.due_date
    @addAllFriends()
    @addAllCategories()
    @addAllStatuses()
    this.$("form").backboneLink(@model)

    return this
