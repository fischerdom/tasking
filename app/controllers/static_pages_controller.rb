class StaticPagesController < ApplicationController
  def start
    @users = User.all
    @tasklists = Tasklist.all
  end
end
