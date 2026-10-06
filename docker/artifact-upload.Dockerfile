FROM maven:3.8.6-openjdk-8-slim
WORKDIR /workspace

# Install APL Root CA cert to system CA store. (Required for package installation.)
COPY ./docker/assets/apl-certs/* /usr/local/share/ca-certificates/
RUN apt-get update && apt-get install ca-certificates -y
RUN update-ca-certificates

# Copy artifacts and Maven upload config.
COPY . .

# Copy remote repo settings.
COPY ./docker/assets/artifact-upload-settings.xml /usr/share/maven/ref/settings.xml

# No CMD, because we need the password, and it's hard to override only CMD/runtime args in Docker.

# TODO: Consider migrating from Maven to using the Artifactory CLI.
