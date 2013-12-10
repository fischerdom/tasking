Tasking.Views.Users ||= {}

class Tasking.Views.Users.RankingView extends Backbone.View
  template: JST["backbone/templates/users/ranking"]

  initialize: () ->
    
    #@options.users.bind('reset', @addAll)

  addAll: () =>
    if(@RBP.length > 0)
      @RBP.each(@addOne)
    else
      @$("ol#RBP").append("<li> No User found</li>")
    @$("ol#RBP").listview('refresh');
    
  addAllCrown: () =>
    if(@RBC.length > 0)
      @RBC.each(@addOneCrown)
    else
      @$("ol#RBC").append("<li> No User found</li>")
    @$("ol#RBC").listview('refresh');
    
  addOne: (rbp) =>
    @$("ol#RBP").append("<li>" + rbp.attributes.name + " " + rbp.attributes.points + "</li>")
    
  addOneCrown: (rbc) =>
    @$("ol#RBC").append("<li>" + rbc.attributes.name + " " + rbc.attributes.crowns.length + "</li>")

  render: =>
    $(@el).html(@template)
    
    
    @RBP = new Tasking.Collections.UserCollection()
    @RBP.url="/users/ranking"
    @RBP.fetch(success: @addAll, async: true)
    
    @RBC = new Tasking.Collections.UserCollection()
    @RBC.url="/users/crowns"
    @RBC.fetch(success: @addAllCrown, async: true)
    
    
     
    return this
