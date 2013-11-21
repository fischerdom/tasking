class SessionsController < ApplicationController
  def create
    user = User.from_omniauth(env["omniauth.auth"])
    session[:user_id] = user.id
    #redirect_to Rails.root
    redirect_to "/#start"
  end

  def destroy
    session[:user_id] = nil
    #redirect_to Rails.url
  end
end