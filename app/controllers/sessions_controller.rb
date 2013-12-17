# Controller to load user in session
class SessionsController < ApplicationController
  
  # Creates the user sesssion and redirects to close page
  def create
    user = User.from_omniauth(env["omniauth.auth"])
    session[:user_id] = user.id
    redirect_to "/#close"
  end

  # Destroys the user and redirect to close page
  def destroy
    session[:user_id] = nil
    
    redirect_to "/#close"
  end
end