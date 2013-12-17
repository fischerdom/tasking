# User Controller, used to show current user and ranking
class UsersController < ApplicationController
  include UsersHelper
  before_action :set_user, only: [:show, :edit, :update, :destroy]

  
  # GET/users/ranking
  # @return a JSON list of users ordered by ranking
  def ranking
    
    respond_to do |format|
      format.html { render action: 'new' }
      format.json { render :json => Ranking.calculate_by(current_user).to_json(:methods => :points) }
    end
  end
  
  # GET/users/ranking
  # @return a JSON list ordered by crowns
  def crowns
    respond_to do |format|
      format.html { render action: 'new' }
      format.json { render :json => Ranking.crowns_by(current_user).to_json(:methods => :crowns) }
    end
  end
  
  # GET/users/ranking
  # @return a JSON representation of the user
  def current
    respond_to do |format|
      format.html { render action: 'new' }
      format.json { render :json => current_user.to_json(:methods => :friends) }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_user
      @user = User.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def user_params
      params.require(:user).permit(:id, :uid, :name, :oauth_token, :oauth_expires_at, :created_at)
    end
end
