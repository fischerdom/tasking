class Tasking.Routers.StatusesRouter extends Backbone.Router
  initialize: (options) ->
    @statuses = new Tasking.Collections.StatusesCollection()
    @statuses.reset options.statuses

  routes:
    "new"      : "newStatus"
    "index"    : "index"
    ":id/edit" : "edit"
    ":id"      : "show"
    ".*"        : "index"

  newStatus: ->
    @view = new Tasking.Views.Statuses.NewView(collection: @statuses)
    $("#statuses").html(@view.render().el).trigger('create')

  index: ->
    @view = new Tasking.Views.Statuses.IndexView(statuses: @statuses)
    $("#statuses").html(@view.render().el).trigger('create')

  show: (id) ->
    status = @statuses.get(id)

    @view = new Tasking.Views.Statuses.ShowView(model: status)
    $("#statuses").html(@view.render().el).trigger('create')

  edit: (id) ->
    status = @statuses.get(id)

    @view = new Tasking.Views.Statuses.EditView(model: status)
    $("#statuses").html(@view.render().el).trigger('create')
