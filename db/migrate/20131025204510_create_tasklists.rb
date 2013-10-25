class CreateTasklists < ActiveRecord::Migration
  def change
    create_table :tasklists do |t|
      t.integer :user_id
      t.string :name

      t.timestamps
    end
  end
end
