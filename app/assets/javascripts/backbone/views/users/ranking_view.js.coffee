Tasking.Views.Users ||= {}

# View to show all rankings
class Tasking.Views.Users.RankingView extends Backbone.View
  template: JST["backbone/templates/users/ranking"]

  # Add the simple ratin to the ol list
  addAll: () =>
    if(@RBP.length > 0)
      @RBP.each(@addOne)
    else
      @$("ol#RBP").append("<li> No User found</li>")
    @$("ol#RBP").listview('refresh');
    
  # Add the crown rating to the ol list
  addAllCrown: () =>
    if(@RBC.length > 0)
      @RBC.each(@addOneCrown)
    else
      @$("ol#RBC").append("<li> No User found</li>")
    @$("ol#RBC").listview('refresh');
   
  # render one simple rating to the ol list 
  # @param rbp User model object to render
  addOne: (rbp) =>
    @$("ol#RBP").append("<li>" + rbp.attributes.name + " " + rbp.attributes.points + "</li>")
   
  # render one simple rating to the ol list 
  # @param rbc User model object to render 
  addOneCrown: (rbc) =>
    @$("ol#RBC").append("<li>" + rbc.attributes.name + " " + rbc.attributes.crowns.length + "</li>")

  # Renders the template and fetches the ranking users
  render: =>
    $(@el).html(@template)
    
    
    @RBP = new Tasking.Collections.UserCollection()
    @RBP.url="/users/ranking"
    @RBP.fetch(success: @addAll, async: true)
    
    @RBC = new Tasking.Collections.UserCollection()
    @RBC.url="/users/crowns"
    @RBC.fetch(success: @addAllCrown, async: true)
    
    
     
    return this
