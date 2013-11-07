class Tasking.Routers.CategoriesRouter extends Backbone.Router
  initialize: (options) ->
    @categories = new Tasking.Collections.CategoriesCollection()
    @categories.reset options.categories

  routes:
    "new"      : "newCategory"
    "index"    : "index"
    ":id/edit" : "edit"
    ":id"      : "show"
    ".*"        : "index"

  newCategory: ->
    @view = new Tasking.Views.Categories.NewView(collection: @categories)
    $("#categories").html(@view.render().el).trigger('create')

  index: ->
    @view = new Tasking.Views.Categories.IndexView(categories: @categories)
    $("#categories").html(@view.render().el).trigger('create')

  show: (id) ->
    category = @categories.get(id)

    @view = new Tasking.Views.Categories.ShowView(model: category)
    $("#categories").html(@view.render().el).trigger('create')

  edit: (id) ->
    category = @categories.get(id)

    @view = new Tasking.Views.Categories.EditView(model: category)
    $("#categories").html(@view.render().el).trigger('create')
