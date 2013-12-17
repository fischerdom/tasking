Tasking.Views.Tasks ||= {}

# View to create a new task
class Tasking.Views.Tasks.NewView extends Backbone.View
  template: JST["backbone/templates/tasks/new"]

  events:
    "submit #new-task": "save"
    
  # constructor to generate a new task model
  constructor: (options) ->
    super(options)
    @router = options.router
    @model = new @collection.model()
 

    @model.bind("change:errors", () =>
      this.render()
    )

  # saves and syncs the model, filled by the form
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
        @router.initialize()
        window.location.hash = "tasklists/detail"

      error: (task, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )
    
  # Fetches Categories  
  addAllCategories: () =>
     @collectionCategory = new Tasking.Collections.CategoriesCollection()
     @collectionCategory.fetch({success :@addAllCategoriesAfterFetch})
      
  # Adds Categories to select-box
  addAllCategoriesAfterFetch: () =>
    @collectionCategory.each(@addOneCategory)

  # Renders one Categories 
  # @param category category model object to render
  addOneCategory: (category) =>
    view = new Tasking.Views.Tasks.XCategoryView({model : category})
    @$("#select-category").append(view.render().el) 
   
  # Fetches friends and renders him 
  addAllFriends: () =>
     @addOneFriend(current_user.toJSON())
     for obj in window.current_user.attributes.friends
       @addOneFriend(obj)
       
  # renders one friend in select-box
  addOneFriend: (friend) =>
    view = new Tasking.Views.Tasks.FriendsView({model : friend})
    @$("#select-friend").append(view.render().el)    
   
  # Fetches tasklists from server 
  addAllTasklists: () =>
     @collectionTasklist = new Tasking.Collections.TasklistsCollection()
     @collectionTasklist.fetch({success :@addAllTasklistsAfterFetch})
  
  # adds all tasklists to select box
  addAllTasklistsAfterFetch: () =>
    @collectionTasklist.each(@addOneTasklist)

  # Renders one tasklist for select-box
  # @param tasklist tasklist model object to render
  addOneTasklist: (tasklist) =>
    if tasklist.attributes.closed != 1
      view = new Tasking.Views.Tasks.TasklistsView({model : tasklist})
      @$("#select-tasklist").append(view.render().el)
 
  # Renders the template
  render: ->
    $(@el).html(@template(@model.toJSON() ))
    @addAllTasklists()
    @addAllCategories()
    @addAllFriends()
    $("#app").trigger("create");
    this.$("form").backboneLink(@model)

    return this
