Tasking.Views.Tasks ||= {}

class Tasking.Views.Tasks.ShowView extends Backbone.View
  template: JST["backbone/templates/tasks/show"]

  events:
     "change #select-status" : "changeStatus"
  
  addAllStatuses: () =>
    @collectionStatus = new Tasking.Collections.StatusesCollection()
    @collectionStatus.fetch({success :@addAllStatusesAfterFetch})
      
  addAllStatusesAfterFetch: () =>
    @collectionStatus.each(@addOneStatus)
    
  addOneStatus: (status) =>
    view = new Tasking.Views.Tasks.XStatusView({model : status})
    @$("#select-status").append(view.render().el) 
    
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
    
  render: ->
    $(@el).html(@template(@model.toJSON() ))
    @addAllStatuses()
    return this
