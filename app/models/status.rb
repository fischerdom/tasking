# Status Model (Just reading)
class Status < ActiveRecord::Base
  validates :title, presence: true
  has_many :tasks, :dependent => :restrict
  
  # Constant for finished Task
  # @return [Integer] Status id of finished status
  def self.finished
    return 3
  end
end
