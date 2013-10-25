class CreateGenerates < ActiveRecord::Migration
  def change
    create_table :generates do |t|
      t.string :user
      t.integer :fb_user_id
      t.string :first_name
      t.string :last_name
      t.string :email

      t.timestamps
    end
  end
end
