class Task < ActiveRecord::Base
  belongs_to :tasklist
  belongs_to :user, :foreign_key => 'assigned_to', :class_name => "User"
  belongs_to :category
  belongs_to :status
end
