json.array!(@tasks) do |task|
  json.extract! task, :tastlist_id, :category_id, :status_id, :assigned_to, :title, :description, :pointvalue, :due_date, :etc
  json.url task_url(task, format: :json)
end
