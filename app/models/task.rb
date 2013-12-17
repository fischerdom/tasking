# Task Model (read, write operations)
class Task < ActiveRecord::Base
  include ActionView::Helpers::DateHelper
  
  belongs_to :tasklist
  belongs_to :user, :foreign_key => 'assigned_to', :class_name => "User"
  belongs_to :category
  belongs_to :status
  
  validates :tasklist_id, :category_id, :status_id, :title, :pointvalue, :due_date, presence: true 
  
  # Formats the date 
  # @return String
  # @example
  # => in 4 days
  # => before 3 hours
  def due_date_f
    if due_date == nil
      return "-"
    end
    dat = distance_of_time_in_words_to_now(due_date)
    
    if  due_date > Time.now
      "in " + dat
    else
      "before " + dat
    end
  end
  
  # Formats the date
  # @return String
  # @example 10.12.2013 10:15
  def due_date_short
    due_date.strftime('%d.%m.%Y %H:%M')
  end
  
  # Returns owner of the task
  # @return User model object
  def owner
    return self.tasklist.user
  end
  
end
