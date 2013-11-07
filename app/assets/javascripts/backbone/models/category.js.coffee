class Tasking.Models.Category extends Backbone.Model
  paramRoot: 'category'

  defaults:
    id: null
    title: null

class Tasking.Collections.CategoriesCollection extends Backbone.Collection
  model: Tasking.Models.Category
  url: '/categories'
