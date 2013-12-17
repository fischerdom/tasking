Tasking.Views.Friends ||= {}

# View to render friends for select box
class Tasking.Views.Tasks.FriendsView extends Backbone.View
  template: JST["backbone/templates/tasks/friends"]
  tagName: "option"
    
  # renders template
  render: ->
    $(@el).attr("value", @model.id)
    $(@el).html(@template(@model))
    return this