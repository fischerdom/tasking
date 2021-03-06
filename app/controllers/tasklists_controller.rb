# Controller for Tasklists
class TasklistsController < ApplicationController
  include TasklistsHelper
  include FacebookHelper
  before_action :set_tasklist, only: [:show, :edit, :update, :destroy]

  # GET /tasklists
  # GET /tasklists.json
  # @return a JSON list with all tasks the current_user has created
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
  # @return a JSON representation of the tasklist
  def show
    respond_to do |format|
        format.html { redirect_to :root }
        format.json { render json: @tasklists.to_json(:methods => [:done_text, :done_percentage])}
      end
  end
  
  # POST /tasklists
  # POST /tasklists.json
  # Creates a new Tasklist with current_user
  def create
    @tasklist = Tasklist.new(tasklist_params)
    @tasklist.user_id = current_user.id

    respond_to do |format|
      if @tasklist.save
        format.html { redirect_to :root }
        format.json { render json: @tasklists.to_json(:methods => [:done_text, :done_percentage])}
      else
        format.html { render action: 'new' }
        format.json { head :no_content }
      end
    end
  end

  # PATCH/PUT /tasklists/1
  # PATCH/PUT /tasklists/1.json
  # Updates a tasklist and sets the king
  def update
    respond_to do |format|
      # Just the owner can update the task
      # When the task is closed, the king will be calculated
      if @tasklist.user.id == current_user.id and @tasklist.update(tasklist_params)
        king = King.calculate_by(@tasklist)
        if @tasklist.closed == 1 and king != nil
          @tasklist.king_id = king.id
          
          Fb.facebook_put_to_wall(@tasklist)
        else
          @tasklist.king_id = nil
        end
        @tasklist.save
        format.html { redirect_to :root }
        format.json { render json: @tasklists.to_json(:methods => [:done_text, :done_percentage])}
      else
        format.html { redirect_to :root }
        format.json { render json: :no_content }
      end
    end
  end

  # DELETE /tasklists/1
  # DELETE /tasklists/1.json
  # Deletes a tasklist
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
      params.require(:tasklist).permit(:user_id, :name, :closed,:oauth_token)
    end
end
