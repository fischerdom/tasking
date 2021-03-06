# Model for a Tasklist
# by default closed = 0
class Tasking.Models.Tasklist extends Backbone.Model
  paramRoot: 'tasklist'

  defaults:
    id: null
    user_id: null
    name: null
    closed: "0"

# Collection which retrieves all tasklists
class Tasking.Collections.TasklistsCollection extends Backbone.Collection
  model: Tasking.Models.Tasklist
  url: '/tasklists'
