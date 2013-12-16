Tasking.Views.Static ||= {}

# Renders the startpage with all menu options
class Tasking.Views.Static.StartView extends Backbone.View
  template: JST["backbone/templates/static/start"]
  
  # renders the template
  render: =>
    $(@el).html(@template(window.current_user.toJSON()))

    return this