class Tasking.Models.User extends Backbone.Model
  paramRoot: 'user'

  defaults:
    provider: null
    uid: null
    name: null
    outh_token: null
    outh_expires_at: null

class Tasking.Collections.UsersCollection extends Backbone.Collection
  model: Tasking.Models.User
  url: '/users'
