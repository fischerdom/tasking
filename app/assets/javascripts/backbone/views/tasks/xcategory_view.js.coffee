Tasking.Views.XCategories ||= {}

# View to show a Category in a select box
class Tasking.Views.Tasks.XCategoryView extends Backbone.View
  template: JST["backbone/templates/tasks/categories"]
  tagName: "option"
  
  # Renders the template
  render: ->
    $(@el).attr("value", @model.attributes.id)
    $(@el).html(@template(@model.toJSON() ))
    return this