# User Helper methods
module UsersHelper
  # Class for Ranking methods
  class Ranking
    # Calculates ranking based by user and his friends
    # @param user user object
    # @return List of users sorted by ranking 
    def self.calculate_by(user)
      users = user.friends
      users.append(user)
      
      return users.sort!{ |x, y| y.points <=> x.points}
    end
    
    # Calculates crown ranking based by user and his friends
    # @param user user object
    # @return List of users sorted by crowns 
    def self.crowns_by(user)
      users = user.friends
      users.append(user)
      
      return users.sort!{ |x, y| y.crowns.size <=> x.crowns.size}
    end
  end
end
