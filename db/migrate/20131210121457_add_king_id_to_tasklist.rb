class AddKingIdToTasklist < ActiveRecord::Migration
  def change
    add_column :tasklists, :king_id, :integer
  end
end
