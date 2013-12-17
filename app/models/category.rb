# Category view
class Category < ActiveRecord::Base
  validates :title, presence: true
  has_many :tasks, :dependent => :restrict
end
