FROM docker-remote.artifactory.jhuapl.edu/library/node:18.20.8-bullseye-slim AS build
WORKDIR /workspace

# Install APL Root CA cert
COPY docker/assets/apl-certs/* /usr/local/share/ca-certificates/
RUN apt-get update && apt-get install ca-certificates -y
RUN update-ca-certificates
RUN npm config set cafile="/etc/ssl/certs/ca-certificates.crt" -g

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Angular app
RUN npm run buildProduction

# Production stage
FROM docker-remote.artifactory.jhuapl.edu/library/tomcat:9.0-slim

# Import APL Root CA into Java Truststore for Tomcat
COPY docker/assets/apl-certs/JHUAPL-MS-Root-CA-05-21-2038-B64-text.crt /tmp/apl-root-ca.cer
RUN keytool -import -trustcacerts -alias apl_root -file /tmp/apl-root-ca.cer \
    -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit -noprompt && \
    rm /tmp/apl-root-ca.cer

# Copy built Angular app to Tomcat's root webapp directory
COPY --from=build /workspace/dist/EPIC /usr/local/tomcat/webapps/EPIC

# Copy config template
COPY docker/config/app-config.json.template /usr/local/tomcat/webapps/EPIC/assets/data/app-config.json.template

COPY docker/config/server.xml.template /usr/local/tomcat/conf/server.xml.template
# Entrypoint to substitute env vars
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Tomcat defaults to 8080 (Non-privileged, works in rootless Podman)
EXPOSE 8080 8443

ENTRYPOINT ["/entrypoint.sh"]
