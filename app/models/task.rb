class Task < ActiveRecord::Base
  include ActionView::Helpers::DateHelper
  
  belongs_to :tasklist
  belongs_to :user, :foreign_key => 'assigned_to', :class_name => "User"
  belongs_to :category
  belongs_to :status
  
  validates :tasklist_id, :category_id, :status_id, :title, :pointvalue, :due_date, presence: true 
  
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
  
  def due_date_short
    due_date.strftime('%d.%m.%Y %H:%M')
  end
  
  def owner
    return self.tasklist.user
  end
  
end
