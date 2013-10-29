class ChangeColumntasklistIdTasklistIdToTask < ActiveRecord::Migration
  def change
    rename_column :tasks, :tasklist_id, :tasklist_id
  end
end
