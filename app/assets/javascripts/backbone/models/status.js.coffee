# Model for the status
# just reading operations
class Tasking.Models.Status extends Backbone.Model
  paramRoot: 'status'

  defaults:
    id: null
    title: null

# List with all possible statuses
class Tasking.Collections.StatusesCollection extends Backbone.Collection
  model: Tasking.Models.Status
  url: '/statuses.json'
