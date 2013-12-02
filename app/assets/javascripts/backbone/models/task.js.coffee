class Tasking.Models.Task extends Backbone.Model
  paramRoot: 'task'

  defaults:
    id: null
    tasklist_id: null
    category_id: null
    status_id: null
    assigned_to: null
    title: null
    description: null
    pointvalue: null
    due_date: null
    etc: null
    categories: null
    tasklists: null
    

class Tasking.Collections.TasksCollection extends Backbone.Collection
  model: Tasking.Models.Task
  url: '/tasks'
