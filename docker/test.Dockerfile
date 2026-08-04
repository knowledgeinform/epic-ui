FROM docker-remote.artifactory.jhuapl.edu/library/node:18.20.8-slim
WORKDIR /workspace

# Install APL Root CA cert to system CA store. (Required for package installation.)
COPY ./docker/assets/apl-certs/* /usr/local/share/ca-certificates/
RUN apt-get update && apt-get install ca-certificates -y
RUN update-ca-certificates
RUN npm config set cafile /etc/ssl/certs/ca-certificates.crt

# Browser runtime for headless Karma in CI.
RUN apt-get update && apt-get install -y chromium && rm -rf /var/lib/apt/lists/*

ENV NG_CLI_ANALYTICS=ci
ENV CHROME_BIN=/usr/bin/chromium

COPY . .

CMD npm ci && npm run test:ci
