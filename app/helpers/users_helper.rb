module UsersHelper
  class Ranking
    def self.calculate_by(user)
      users = user.friends
      users.append(user)
      
      return users.sort!{ |x, y| x <=> y}
    end
  end
end
