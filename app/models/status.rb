class Status < ActiveRecord::Base
  has_many :tasks, :dependent => :restrict
  
  def self.finished
    return 3
  end
end
