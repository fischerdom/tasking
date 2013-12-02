class Tasking.Models.Status extends Backbone.Model
  paramRoot: 'status'

  defaults:
    id: null
    title: null

class Tasking.Collections.StatusesCollection extends Backbone.Collection
  model: Tasking.Models.Status
  url: '/statuses.json'
