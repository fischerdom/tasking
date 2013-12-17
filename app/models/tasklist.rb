# Tasklist model
class Tasklist < ActiveRecord::Base
  belongs_to :user
  belongs_to :king, :foreign_key => 'king_id', :class_name => "User"
  has_many :tasks, :dependent => :destroy
  
  validates :user_id, :name, presence: true
  
  # Returns text of how many tasks are done
  # @return STring
  def done_text
    return "%d of %d tasks" % [self.open_tasks.size, self.tasks.size]
  end
  
  # Calculates percentage of done Tasks
  # @return Integer 0 <= x <= 100
  def done_percentage
    if self.tasks.size > 0
      return (self.open_tasks.size.to_f / self.tasks.size.to_f * 100.0).to_i
    else
      return -1
    end
  end
  
  # Returns list of open task
  def open_tasks 
     return self.tasks.find_all { |task| task.status_id == Status.finished} 
  end
    
end
