Tasking.Views.Users ||= {}

class Tasking.Views.Users.RankingView extends Backbone.View
  template: JST["backbone/templates/users/ranking"]

  initialize: () ->
    
    #@options.users.bind('reset', @addAll)

  addAll: () =>
    if(@RBP.length > 0)
      @RBP.each(@addOne)
    else
      @$("ol#RBP").append("<li>No completed Tasks found</li>")
    @$("ol").listview('refresh');

  addOne: (rbp) =>
    @$("ol#RBP").append("<li>" + rbp.attributes.name + " " + rbp.attributes.points + "</li>")
    #view = new Tasking.Views.Tasklists.TasklistDetailTaskView({task : task})
    #@$("ul").append(view.render().el)

  render: =>
    $(@el).html(@template)
    
    
    @RBP = new Tasking.Collections.UserCollection()
    @RBP.url="/users/ranking"
    @RBP.fetch(success: @addAll, async: true)
    
     
    return this
