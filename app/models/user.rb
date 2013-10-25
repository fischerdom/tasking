class User < ActiveRecord::Base
  has_many :tasks, :dependent => :restrict
  has_many :task_lists, :dependent => :destroy
  
  def to_s
    first_name + " " + last_name
  end
end
