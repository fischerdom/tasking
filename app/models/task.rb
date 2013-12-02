class Task < ActiveRecord::Base
  include ActionView::Helpers::DateHelper
  
  belongs_to :tasklist
  belongs_to :user, :foreign_key => 'assigned_to', :class_name => "User"
  belongs_to :category
  belongs_to :status
  
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
  
end
