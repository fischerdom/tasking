require 'test_helper'

class GeneratesControllerTest < ActionController::TestCase
  setup do
    @generate = generates(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:generates)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create generate" do
    assert_difference('Generate.count') do
      post :create, generate: { email: @generate.email, fb_user_id: @generate.fb_user_id, first_name: @generate.first_name, last_name: @generate.last_name, user: @generate.user }
    end

    assert_redirected_to generate_path(assigns(:generate))
  end

  test "should show generate" do
    get :show, id: @generate
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @generate
    assert_response :success
  end

  test "should update generate" do
    patch :update, id: @generate, generate: { email: @generate.email, fb_user_id: @generate.fb_user_id, first_name: @generate.first_name, last_name: @generate.last_name, user: @generate.user }
    assert_redirected_to generate_path(assigns(:generate))
  end

  test "should destroy generate" do
    assert_difference('Generate.count', -1) do
      delete :destroy, id: @generate
    end

    assert_redirected_to generates_path
  end
end
