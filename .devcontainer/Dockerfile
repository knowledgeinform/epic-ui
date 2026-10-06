FROM docker-remote.artifactory.jhuapl.edu/library/node:18.20.8-bullseye-slim

# Install APL Root CA cert
COPY docker/assets/apl-certs/* /usr/local/share/ca-certificates/
RUN apt-get update && apt-get install -y ca-certificates && \
    update-ca-certificates && \
    npm config set cafile="/etc/ssl/certs/ca-certificates.crt" -g

# Install Angular CLI globally for development
RUN npm install -g @angular/cli@12

# Install development dependencies
WORKDIR /workspace
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose ports for Angular dev server and livereload
EXPOSE 4200 49153

# Default command - start Angular dev server
CMD ["npm", "run", "start"]
