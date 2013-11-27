#Zugriff auf Facebook Konfigurationsdatei:
FACEBOOK_CONFIG = YAML.load_file("#{Rails.root}/config/facebook.yml")[Rails.env]

OmniAuth.config.logger = Rails.logger

#Omniauth initialisieren
Rails.application.config.middleware.use OmniAuth::Builder do

  provider :facebook, FACEBOOK_CONFIG['app_id'], FACEBOOK_CONFIG['secret_id'], 
  :scope => 'read_friendlists,read_mailbox,read_stream, manage_friendlists,publish_actions,publish_stream'

end