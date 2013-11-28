class TasklistsController < ApplicationController
  before_action :set_tasklist, only: [:show, :edit, :update, :destroy]

  # GET /tasklists
  # GET /tasklists.json
  def index
    if(current_user != nil)
      @tasklists = Task.where("user_id = ?", current_user.id)
      respond_to do |format|
        format.html { redirect_to :root }
        format.json { render json: @tasklists}
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

    respond_to do |format|
      if @tasklist.save
        format.html { redirect_to @tasklist, notice: 'Tasklist was successfully created.' }
        format.json { render action: 'show', status: :created, location: @tasklist }
      else
        format.html { render action: 'new' }
        format.json { render json: @tasklist.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /tasklists/1
  # PATCH/PUT /tasklists/1.json
  def update
    respond_to do |format|
      if @tasklist.update(tasklist_params)
        format.html { redirect_to @tasklist, notice: 'Tasklist was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @tasklist.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tasklists/1
  # DELETE /tasklists/1.json
  def destroy
    @tasklist.destroy
    respond_to do |format|
      format.html { redirect_to tasklists_url }
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
      params.require(:tasklist).permit(:user_id, :name)
    end
end
