class StatusesController < ApplicationController
  
  # GET /statuses
  # GET /statuses.json
  def index
    @statuses = Status.all
    respond_to do |format|
      format.html { redirect_to :root }
      format.json { render json: @statuses}
    end
  end

end
