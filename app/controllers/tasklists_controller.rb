class TasklistsController < ApplicationController
  include TasklistsHelper
  before_action :set_tasklist,:facebook_at, only: [:show, :edit, :update, :destroy]

  # GET /tasklists
  # GET /tasklists.json
  def index
    if(current_user != nil)
      @tasklists = Tasklist.where("user_id = ?", current_user.id)
      respond_to do |format|
        format.html { redirect_to :root }
        format.json { render json: @tasklists.to_json(:methods => [:done_text, :done_percentage])}
      end
    else
      respond_to do |format|
        format.html { redirect_to :root }
        format.json { render json: nil}
      end
    end
  end

  # GET /tasklists/1
  # GET /tasklists/1.json
  def show
    respond_to do |format|
        format.html { redirect_to :root }
        format.json { render json: @tasklist}
      end
  end

  # GET /tasklists/new
  def new
    @tasklist = Tasklist.new
  end

  # GET /tasklists/1/edit
  def edit
  end

  # POST /tasklists
  # POST /tasklists.json
  def create
    @tasklist = Tasklist.new(tasklist_params)
    @tasklist.user_id = current_user.id

    respond_to do |format|
      if @tasklist.save
        format.html { redirect_to :root }
        format.json { render json: @tasklist }
      else
        format.html { render action: 'new' }
        format.json { head :no_content }
      end
    end
  end

  # PATCH/PUT /tasklists/1
  # PATCH/PUT /tasklists/1.json
  def update
    respond_to do |format|
      # Just the owner can update the task
      # When the task is closed, the king will be calculated
      if @tasklist.user.id == current_user.id and @tasklist.update(tasklist_params)
        if @tasklist.closed == 1
          @tasklist.king_id = King.calculate_by(@tasklist).id
          facebook_notification()
        else
          @tasklist.king_id = nil
        end
        @tasklist.save
        format.html { redirect_to :root }
        format.json { render json: @tasklist }
      else
        format.html { redirect_to :root }
        format.json { render json: :no_content }
      end
    end
  end

  def facebook_notification
    facebook_at.put_connections(User.find_by_id(@tasklist.king_id).uid,"notifications",template: "@[" + current_user.uid + "] crowned you to the King of the following tasklist: " + @tasklist.name, href: "")
  end
  
  def facebook_at
    @facebook_at = Koala::Facebook::API.new(Koala::Facebook::OAuth.new().get_app_access_token)
    return @facebook_at
  end
  # DELETE /tasklists/1
  # DELETE /tasklists/1.json
  def destroy
    # Just the owner can delete the task
    if current_user.id == @tasklist.user.id
      @tasklist.destroy
    end
    respond_to do |format|
      format.html { render action: 'taskslists'}
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_tasklist
      @tasklist = Tasklist.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def tasklist_params
      params.require(:tasklist).permit(:user_id, :name, :closed)
    end
end
