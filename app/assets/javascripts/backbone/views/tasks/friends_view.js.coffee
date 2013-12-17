Tasking.Views.Friends ||= {}

# View to render friends for select box
class Tasking.Views.Tasks.FriendsView extends Backbone.View
  template: JST["backbone/templates/tasks/friends"]
  tagName: "option"
    
  # Initializer
  initialize: (options) => 
    @selected = options.selected
    
  # renders template
  render: ->
    $(@el).attr("value", @model.id)
    if @selected
      $(@el).attr("selected","selected")
    $(@el).html(@template(@model))
    return this