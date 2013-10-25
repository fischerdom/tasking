class ChangeColumnTastlistIdTasklistIdToTask < ActiveRecord::Migration
  def change
    rename_column :tasks, :tastlist_id, :tasklist_id
  end
end
