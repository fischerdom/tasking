module FacebookHelper
#This Class handles all connections and functions depending Facebook-integration
#Depending on which function has to be made, different security-tokens are needed
  class Fb
    
    #Get a new Facebook-Connection with an User Token and return it
    def self.fb_user_token(u_token)
      return @fb_user_token = Koala::Facebook::API.new(u_token)
    end
    
    #Get a new Facebook-Connection with an App-Token if not available and return it
    def self.fb_app_token
      if @fb_app_token == nil
        @fb_app_token = Koala::Facebook::API.new(Koala::Facebook::OAuth.new().get_app_access_token)
      end
      return @fb_app_token
    end
  
    #Get the friends of the delivered user by his token and return them
    def self.facebook_get_friends(oauth_token)
      return fb_user_token(oauth_token).get_connections("me", "friends")
    end
    
    #Make a post to the wall of the user who earned the Crown 
    def self.facebook_put_to_wall(tasklist)
      @king_user = User.find_by_id(tasklist.king_id)
      
      fb_user_token(@king_user.oauth_token).put_wall_post("I won a crown for the tasklist: '"+ tasklist.name + "'. 
       Join tasKing, too!", {
      "name" => "tasKing - the social todo-manager",
      "caption" => @king_user.name + " earned the crown for the tasklist: "+ tasklist.name,
      "description" => "Share and accomplish tasks with your friends!",
      "picture" => "http://tasking.herokuapp.com/assets/logos/crown.JPG",
      "link" => "http://tasking.herokuapp.com/"
      })
    end
    
    #Post a notification to the user who got a task assigned
    def self.facebook_note_assign(task,current_user)
      fb_app_token.put_connections(User.find_by_id(task.assigned_to).uid,"notifications",template: "@[" + current_user.uid + "] assigned you the task: " + task.title, href: "")
    end

    #Post a notification to the assginee/owner of a task, 
    #when the status of a task has been changed
    def self.facebook_note_status(tasklist,task,current_user)
      @status_new = Status.find_by_id(task.status_id).title
      if(tasklist.user_id != current_user.id)
        @note_to = User.find_by_id(tasklist.user_id).uid
      else 
        @note_to = User.find_by_id(task.assigned_to).uid
      end
      fb_app_token.put_connections(@note_to,"notifications",template: "@[" + current_user.uid + "] changed the status of the task '" + task.title + "' to: " + @status_new, href: "")
    end
  end
end