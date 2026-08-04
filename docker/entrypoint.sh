#!/bin/sh
set -e

# Path to the webapps root
WEBAPP_ROOT="/usr/local/tomcat/webapps/EPIC"

# Copy template to final config location
cp ${WEBAPP_ROOT}/assets/data/app-config.json.template \
  ${WEBAPP_ROOT}/assets/data/app-config.json

# Substitute environment variables using sed (avoids gettext-base dependency)
env | while IFS='=' read -r key value; do
  # Escape special sed characters in the value (&, /, \)
  escaped_value=$(printf '%s\n' "$value" | sed -e 's/[&\/\\]/\\&/g')
  # Replace ${KEY} patterns in the config file
  sed -i "s|\${${key}}|${escaped_value}|g" ${WEBAPP_ROOT}/assets/data/app-config.json
done

echo "Config loaded:"
cat ${WEBAPP_ROOT}/assets/data/app-config.json

# Setup server.xml
TOMCAT_CONF="/usr/local/tomcat/conf"

cp "$TOMCAT_CONF/server.xml.template" "$TOMCAT_CONF/server.xml"

# Start Tomcat
exec catalina.sh run
