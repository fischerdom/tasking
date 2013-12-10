module TasklistsHelper
  class King
    def self.calculate_by(tasklist)

      res = Task.find(
        :all,
        :select => 'assigned_to, SUM(pointvalue)',
        :group => 'assigned_to',
        :conditions => ['tasklist_id = ? AND status_id = ?', tasklist.id, Status.finished],
        :order => 'SUM(pointvalue) DESC',
        :limit => 1
      ).first
      
      king = User.find(res["assigned_to"])
      return king
    end
    
  end
end
