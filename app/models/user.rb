class User < ActiveRecord::Base
  has_many :tasks, :foreign_key => :assigned_to
  has_many :tasklists
  
  def self.from_omniauth(auth)
    where(auth.slice(:provider, :uid)).first_or_initialize.tap do |user|
      user.provider = auth.provider
      user.uid = auth.uid
      user.name = auth.info.name
      user.oauth_token = auth.credentials.token
      user.oauth_expires_at = Time.at(auth.credentials.expires_at)
      user.save!
    end
  end
 
  def facebook
      @facebook = Koala::Facebook::API.new(oauth_token)
  end
  
  ##
  # Retrive the list of registrated facebook friends of the user
  def friends
      if @friends == nil
        
      #Hole alle Freunde mittels Facebook-Connection
      @friends_all = facebook.get_connections("me", "friends")
      
      #Nachfolgend wird die Freundesliste gefiltert, um nur die zu erhalten, die tatsächlich in der DB enthalten sind
      
      @friends = Array.new
      
      @friends_all.each do |entry|
        user = User.find_by uid: entry["id"]
        if user
            @friends.append(user)
        end
        
        return @friends
      end
      else
        return @friends
      end
  end
  
  ##
  # Calculates the sum of poinvalues of the user.
  def points
    sum = 0
    tasks = self.tasks.where(:status_id => Status.finished)
    tasks.each {|task| sum = sum + task.pointvalue}
    return sum
  end
end