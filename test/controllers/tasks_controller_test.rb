require 'test_helper'

class TasksControllerTest < ActionController::TestCase
  setup do
    @task = tasks(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:tasks)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create task" do
    assert_difference('Task.count') do
      post :create, task: { assigned_to: @task.assigned_to, category_id: @task.category_id, description: @task.description, due_date: @task.due_date, etc: @task.etc, pointvalue: @task.pointvalue, status_id: @task.status_id, tastlist_id: @task.tastlist_id, title: @task.title }
    end

    assert_redirected_to task_path(assigns(:task))
  end

  test "should show task" do
    get :show, id: @task
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @task
    assert_response :success
  end

  test "should update task" do
    patch :update, id: @task, task: { assigned_to: @task.assigned_to, category_id: @task.category_id, description: @task.description, due_date: @task.due_date, etc: @task.etc, pointvalue: @task.pointvalue, status_id: @task.status_id, tastlist_id: @task.tastlist_id, title: @task.title }
    assert_redirected_to task_path(assigns(:task))
  end

  test "should destroy task" do
    assert_difference('Task.count', -1) do
      delete :destroy, id: @task
    end

    assert_redirected_to tasks_path
  end
end
