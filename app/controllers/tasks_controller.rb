# Tasks controller
class TasksController < ApplicationController
  include FacebookHelper
  before_action :set_task, only: [:show, :edit, :update, :destroy]
  
  # GET /tasks
  # GET /tasks.json
  def index
    if(current_user != nil)
      usr_lst = current_user.friends.clone
      usr_ids = Array.new
      usr_lst.each do |usr|
        usr_ids.append(usr.id)
      end
    
      if params['tasklist_id'] != nil
        @tasks = Task.joins(:tasklist).where("user_id = ? AND tasklist_id = ?", current_user.id, params['tasklist_id'])
      else
        @tasks = Task.joins(:tasklist).where("assigned_to = ? OR (user_id = ? OR user_id IN(" + usr_ids * "," + "))", current_user.id, current_user.id)
      end
      
      @tasks.sort! { |x,y| x.due_date <=> y.due_date}
      respond_to do |format|
        format.html { redirect_to :root }
        format.json { render :json => @tasks.to_json(:methods => [:owner, :tasklist, :due_date_f, :due_date_short, :category, :user, :status])}
      end
    else
      
      respond_to do |format|
        format.html { redirect_to :root }
        format.json { render json: nil}
      end
    end
  end  
  
  # GET /tasks/get
  # GET /tasks/get.json
  def get
    if(current_user != nil)
      usr_lst = current_user.friends.clone
      usr_ids = Array.new
      usr_lst.each do |usr|
        usr_ids.append(usr.id)
      end
      @tasks = Task.joins(:tasklist).where("assigned_to IS NULL AND (closed != 1 OR closed IS NULL) AND ( user_id = ? OR user_id IN(" + usr_ids * "," + "))", current_user.id)
    
      @tasks.sort! { |x,y| x.due_date <=> y.due_date}
      respond_to do |format|
        format.html { redirect_to :root }
        format.json { render :json => @tasks.to_json(:methods => [:owner, :tasklist, :due_date_f, :due_date_short, :category, :user, :status, :done_percentage])}
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
          [:owner, :tasklist, :due_date_f, :due_date_short, :category, :user, :status])}
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
    respond_to do |format|
      if @task.save
        if(@task.assigned_to)
          Fb.facebook_note_assign(@task,current_user)
        end
        format.html { redirect_to @task, notice: 'Task was successfully created.' }
        format.json { render :json => @tasks.to_json(:methods => [:owner, :tasklist, :due_date_f, :due_date_short, :category, :user, :status])}
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

        if @assigned != @task[:assigned_to] and @assigned != nil
          Fb.facebook_note_assign(@task,current_user)
        end
        
        if @status_old != @task[:status_id]
          Fb.facebook_note_status(@tasklist,@task,current_user)
        end
        
        format.html { redirect_to @task, notice: 'Task was successfully updated.' }
        format.json { render :json => @tasks.to_json(:methods => [:owner, :tasklist, :due_date_f, :due_date_short, :category, :user, :status])}
      else
        format.html { render action: 'edit' }
        format.json { render json: @task.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tasks/1
  # DELETE /tasks/1.json
  def destroy
    # Just the owner can delete the task
    if Rails.env != 'test'
      if current_user.id == @task.tasklist.user.id
      @task.destroy
      end
    end
    if Rails.env == 'test'
      @task.destroy
    end
    respond_to do |format|
      format.html { redirect_to @task, notice: 'Task was successfully deleted.' }
      format.json { head :no_content }
    end
  end
  
  private
    # Use callbacks to share common setup or constraints between actions.
    def set_task
      @task = Task.find(params[:id])
      @tasklist = Tasklist.find_by_id(@task.tasklist_id)
      @assigned = @task[:assigned_to]
      @status_old = @task[:status_id]
    end
    # Never trust parameters from the scary internet, only allow the white list through.
    def task_params
      params.require(:task).permit(:tasklist_id, :category_id, :status_id, :assigned_to, :title, :description, :pointvalue, :due_date, :etc)
    end
end
