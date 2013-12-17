Tasking.Views.Tasks ||= {}

# View to show a single task
class Tasking.Views.Tasks.ShowView extends Backbone.View
  template: JST["backbone/templates/tasks/show"]

  events:
     "change #select-status" : "changeStatus"
  
  # Fetches statuses from server
  addAllStatuses: () =>
    @collectionStatus = new Tasking.Collections.StatusesCollection()
    @collectionStatus.fetch({success :@addAllStatusesAfterFetch})
 
  # Add statuses to select box to change it
  addAllStatusesAfterFetch: () =>
    @collectionStatus.each(@addOneStatus)
   
  # Renders one status for select box
  # @param status status model object 
  addOneStatus: (status) =>
    view = new Tasking.Views.Tasks.XStatusView({model : status})
    @$("#select-status").append(view.render().el) 
    
  # Change status of object with sync to server
  changeStatus: (e) =>
    @model.attributes.status_id = $("#select-status").val();
    e.preventDefault()
    e.stopPropagation()
    
    @model.save(null,
      success : (task) =>
        @model = task
        window.location.hash = "tasks"
        window.location.reload();
    )
   
  # Renders template 
  render: ->
    $(@el).html(@template(@model.toJSON() ))
    @addAllStatuses()
    return this
