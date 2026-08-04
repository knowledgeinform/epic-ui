FROM docker-remote.artifactory.jhuapl.edu/library/node:18.20.8-slim

WORKDIR /workspace

# Install APL Root CA cert to system CA store. (Required for `npm i`.)
COPY docker/assets/apl-certs/* /usr/local/share/ca-certificates/
RUN apt-get update && apt-get install ca-certificates -y
RUN update-ca-certificates

RUN npm config set cafile="/etc/ssl/certs/ca-certificates.crt" -g

## Start UI server:
EXPOSE 4200

CMD npm i && npm start
