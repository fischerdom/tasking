# TasklistHelpers
module TasklistsHelper
  # Methods for the king functionality
  class King
    # Calculates the king of a tasklist
    def self.calculate_by(tasklist)

      res = Task.find(
        :all,
        :select => 'assigned_to, SUM(pointvalue)',
        :group => 'assigned_to',
        :conditions => ['tasklist_id = ? AND status_id = ? AND assigned_to IS NOT NULL', tasklist.id, Status.finished],
        :order => 'SUM(pointvalue) DESC',
        :limit => 1
      ).first
      
      if res != nil
        king = User.find(res["assigned_to"])
      else
        king = nil
      end
      return king
    end
    
  end
end
