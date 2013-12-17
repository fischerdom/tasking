# Controler for startpage 
class StaticPagesController < ApplicationController
  # Default start page
  def start
    @users = User.all
    @tasklists = Tasklist.all
    @tasks = Task.where(assigned_to: current_user)
  end
  
  # Facebook landing page
  def fb
    respond_to do |format|
      format.html { redirect_to :root}
      format.json { render json: nil}
    end
  end 
end
