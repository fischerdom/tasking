class AddClosedToTasklists < ActiveRecord::Migration
  def change
    add_column :tasklists, :closed, :integer
  end
end
