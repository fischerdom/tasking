class Tasklist < ActiveRecord::Base
  belongs_to :user
  belongs_to :king, :foreign_key => 'king_id', :class_name => "User"
  has_many :tasks, :dependent => :destroy
  
  
  def done_text
    return "%d of %d tasks" % [self.open_tasks.size, self.tasks.size]
  end
  
  def done_percentage
    if self.tasks.size > 0
      return self.open_tasks.size / self.tasks.size * 100
    else
      return -1
    end
  end
  
  def open_tasks 
     return self.tasks.find_all { |task| task.status_id == Status.finished} 
  end
    
end
