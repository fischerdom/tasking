class Status < ActiveRecord::Base
  has_many :tasks, :dependent => :restrict
end
