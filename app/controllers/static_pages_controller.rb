class StaticPagesController < ApplicationController
  def start
    @users = User.all
    @tasklists = Tasklist.all
    @tasks = Task.where(assigned_to: current_user)
  end
  
  def fb
    respond_to do |format|
      format.html { redirect_to :root}
      format.json { render json: nil}
    end
  end 
end
