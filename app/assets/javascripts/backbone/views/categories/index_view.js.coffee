Tasking.Views.Categories ||= {}

class Tasking.Views.Categories.IndexView extends Backbone.View
  template: JST["backbone/templates/categories/index"]

  initialize: () ->
    @options.categories.bind('reset', @addAll)

  addAll: () =>
    @options.categories.each(@addOne)

  addOne: (category) =>
    view = new Tasking.Views.Categories.CategoryView({model : category})
    @$("ul").append(view.render().el)

  render: =>
    $(@el).html(@template(categories: @options.categories.toJSON() ))
    @addAll()

    return this
