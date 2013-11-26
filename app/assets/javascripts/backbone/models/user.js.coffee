class Tasking.Models.User extends Backbone.Model
  paramRoot: 'user'

  defaults:
    id: null
    provider: null
    uid: null
    name: null
    oauth_token: null
    oauth_expires_at: null
    friends: null

class Tasking.Collections.UsersCollection extends Backbone.Collection
  model: Tasking.Models.User
  url: '/users'
