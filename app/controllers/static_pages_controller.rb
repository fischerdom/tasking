class StaticPagesController < ApplicationController
  def start
    @users = User.all
    @tasklists = Tasklist.all
    @tasks = Task.where(assigned_to: '2')
  end
end
