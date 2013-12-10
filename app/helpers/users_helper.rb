module UsersHelper
  class Ranking
    def self.calculate_by(user)
      users = user.friends
      users.append(user)
      
      return users.sort!{ |x, y| y.points <=> x.points}
    end
    
    def self.crowns_by(user)
      users = user.friends
      users.append(user)
      
      return users.sort!{ |x, y| y.crowns.size <=> x.crowns.size}
    end
  end
end
