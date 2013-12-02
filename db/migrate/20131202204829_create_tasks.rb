class CreateTasks < ActiveRecord::Migration
  def change
    create_table :tasks do |t|
      t.integer :tasklist_id
      t.integer :category_id
      t.integer :status_id
      t.integer :assigned_to
      t.string :title
      t.string :description
      t.float :pointvalue
      t.datetime :due_date
      t.float :etc

      t.timestamps
    end
  end
end
