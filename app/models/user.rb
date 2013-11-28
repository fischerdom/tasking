class User < ActiveRecord::Base
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
  
  
  def friends
      #Hole alle Freunde mittels Facebook-Connection
      @friends_all = facebook.get_connections("me", "friends")
      
      #Nachfolgend wird die Freundesliste gefiltert, um nur die zu erhalten, die tatsächlich in der DB enthalten sind
      
      @friends = Array.new
      @friends_all.each do |entry|
        if User.find_by uid: entry["id"]
            @friends.append(entry)
        end
      end
      
      
  end
end