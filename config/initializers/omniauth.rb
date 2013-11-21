OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :facebook, '557026374368942', 'f137fd2a8e668bc240b59d46909e910f'
end