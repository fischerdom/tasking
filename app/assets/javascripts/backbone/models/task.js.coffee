# Model for the task
class Tasking.Models.Task extends Backbone.Model
  paramRoot: 'task'

  defaults:
    id: null
    tasklist_id: null
    category_id: null
    status_id: "1"     #Standardwert für status auf "Open" setzen
    assigned_to: null
    title: null
    description: null
    pointvalue: null
    due_date: null
    etc: null
    categories: null
    tasklists: null
    
# Collection which feteches all the Tasks
class Tasking.Collections.TasksCollection extends Backbone.Collection
  model: Tasking.Models.Task
  url: '/tasks'
