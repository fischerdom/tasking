
# Category controller (just reading operations)
class CategoriesController < ApplicationController

  # GET /categories
  # GET /categories.json
  # @return a JSON list of categories
  def index
    @categories = Category.all
    respond_to do |format|
      format.html { redirect_to :root }
      format.json { render json: @categories}
    end
  end

end
