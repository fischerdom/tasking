json.array!(@tasklists) do |tasklist|
  json.extract! tasklist, :user_id, :name
  json.url tasklist_url(tasklist, format: :json)
end
