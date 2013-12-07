class TasksController < ApplicationController
  before_action :set_task, only: [:show, :edit, :update, :destroy]

  # GET /tasks
  # GET /tasks.json
  def index
    if(current_user != nil)
      if params['tasklist_id'] != nil
        @tasks = Task.where("assigned_to = ? AND tasklist_id = ?", current_user.id, params['tasklist_id'])
      else
        @tasks = Task.where("assigned_to = ?", current_user.id)
      end
      @tasks.sort! { |x,y| x.due_date <=> y.due_date}
      respond_to do |format|
        format.html { redirect_to :root }
        format.json { render :json => @tasks.to_json(:methods => [:due_date_f, :category, :user])}
      end
    else
      
      respond_to do |format|
        format.html { redirect_to :root }
        format.json { render json: nil}
      end
    end
  end

  # GET /tasks/1
  # GET /tasks/1.json
  def show
    respond_to do |format|
        format.html { redirect_to :root }
        format.json { render :json => @task.to_json(:methods => 
          [:due_date_f, :category, :user])}
      end
  end

  # GET /tasks/new
  def new
    @task = Task.new
  end

  # GET /tasks/1/edit
  def edit
  end

  # POST /tasks
  # POST /tasks.json
  def create
    @task = Task.new(task_params)
    @task.status_id = 1
    respond_to do |format|
      if @task.save
        format.html { redirect_to @task, notice: 'Task was successfully created.' }
        format.json { head :no_content }
      else
        format.html { render action: 'new' }
        format.json { head :no_content }
      end
    end
  end

  # PATCH/PUT /tasks/1
  # PATCH/PUT /tasks/1.json
  def update
    respond_to do |format|
      if @task.update(task_params)
        format.html { redirect_to @task, notice: 'Task was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @task.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tasks/1
  # DELETE /tasks/1.json
  def destroy
    @task.destroy
    respond_to do |format|
      format.html { redirect_to tasks_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_task
      @task = Task.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def task_params
      params.require(:task).permit(:tasklist_id, :category_id, :status_id, :assigned_to, :title, :description, :pointvalue, :due_date, :etc)
    end
end
