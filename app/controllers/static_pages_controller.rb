class StaticPagesController < ApplicationController
  def start
    @tasklists = Tasklist.all
  end
end
