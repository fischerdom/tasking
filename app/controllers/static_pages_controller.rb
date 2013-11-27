class StaticPagesController < ApplicationController
  def start
    @users = User.all
    @tasklists = Tasklist.all
    @tasks = Task.where(assigned_to: current_user)
  end
end
