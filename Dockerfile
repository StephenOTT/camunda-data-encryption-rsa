FROM camunda/camunda-bpm-platform:tomcat-7.8.0

# add custom configurations
COPY docker/camunda/conf/ /camunda/conf

# add JS script for RSA encryption
COPY docker/camunda/lib/rsaEncrypt.js /camunda/lib/rsaEncrypt.js