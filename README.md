== README

=== Before install
	-> Request a test grant for the Facebook-Tasking-App from the Contributers of the project

=== Install
==== Install system dependency
	-> Ruby 2.x
	-> Rails 4.x
	-> Python 2.x
	-> PostgreSQL
	-> NodeJs
	-> git
	
==== Get Sources
	-> Navigate to future working dir
	-> Type in command:
	 		git clone git://github.com/fischerdom/tasking.git
	 		
==== Install resources
    -> Navigate to working dir
	-> Type in "bundle install" to install dependent ruby gems
	-> Start PostgreSQL-Server
	-> Type in "rake db:migrate" to install schema to database
	
=== Start server
	-> Navigate to woking dir 
	-> Type in "rails s"
	-> Server should start
