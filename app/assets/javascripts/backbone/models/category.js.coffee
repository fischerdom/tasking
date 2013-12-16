# Model for Category
# fixed model, just reading
class Tasking.Models.Category extends Backbone.Model
  paramRoot: 'category'

  defaults:
    id: null
    title: null

# List for Categories, with url to retrieve the category list
class Tasking.Collections.CategoriesCollection extends Backbone.Collection
  model: Tasking.Models.Category
  url: '/categories.json'
