# Main Controller
class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session
  
  #Session helper for current user
  private
  def current_user
    if session[:user_id] != nil
      if session[:current_user] != nil and session[:current_user].id == session[:user_id] 
        @current_user = session[:current_user]
      else
        @current_user = User.find(session[:user_id])
        session[:current_user] = @current_user
      end
    end
  end
  helper_method :current_user
end
