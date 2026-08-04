#!/bin/bash

# This file controls how the project is built on the CI/CD server.
# Arguments:
#   $1 - Artifactory Password: The password used to upload to SD Artifactory.

set -e

# Get the branch name
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
RELEASE_KEYWORD='release'
MASTER_KEYWORD='master'
SAFE_BRANCH_NAME=${BRANCH_NAME//\//-}

# Get a unique identifier for the epic-ui-build container
HASH=$(git rev-parse HEAD)

# Set Podman Runtime Directory
: "${UID:=$(id -u)}"
export XDG_RUNTIME_DIR="/tmp/podman-run-${UID}"
mkdir -p "${XDG_RUNTIME_DIR}"
chmod 700 "${XDG_RUNTIME_DIR}"

echo "XDG_RUNTIME_DIR=${XDG_RUNTIME_DIR}"

export TMPDIR="/tmp/podman-tmp-${UID}"
mkdir -p "${TMPDIR}"

# Run UI tests and export JUnit results
podman build -t epic-ui-test-$HASH -f ./docker/test.Dockerfile .
if podman ps -a --format '{{.Names}}' | grep -q "^epic-ui-test-$HASH$"; then
  podman rm -f epic-ui-test-$HASH
fi
set +e
podman run \
  --name epic-ui-test-$HASH \
  epic-ui-test-$HASH
TEST_EXIT_CODE=$?
set -e

# Always copy test results from the test container when available.
mkdir -p ./test-results/karma
podman cp epic-ui-test-$HASH:/workspace/test-results/karma/. ./test-results/karma || true
podman rm -f epic-ui-test-$HASH

if [ $TEST_EXIT_CODE -ne 0 ]; then
  echo "UI test container failed with exit code $TEST_EXIT_CODE"
  exit $TEST_EXIT_CODE
fi

# Build UI. Build artifacts should output to `./dist`, due to volume mount.
podman build -t epic-ui-build-$HASH -f ./docker/build.Dockerfile .
if podman ps -a --format '{{.Names}}' | grep -q "^epic-ui-build-$HASH$"; then
  podman rm -f epic-ui-build-$HASH
fi
podman run \
  --name epic-ui-build-$HASH \
  epic-ui-build-$HASH

# Copy the dist file out of the container
podman cp epic-ui-build-$HASH:/workspace/dist ./dist

# Remove the existing container
podman rm epic-ui-build-$HASH

# Archive dist so Bamboo can collect it as a build artifact.
ARTIFACT_NAME="dist-${SAFE_BRANCH_NAME}-${HASH:0:8}.tar.gz"
tar -czf "$ARTIFACT_NAME" -C "$PWD/dist" EPIC -C "$PWD/scripts" deploy
echo "Created build artifact: $ARTIFACT_NAME"

# If not a release or master branch, stop after producing build artifact.
if [[ "$BRANCH_NAME" != "$RELEASE_KEYWORD"* && "$BRANCH_NAME" != "$MASTER_KEYWORD"* ]]; then
  echo "Not a release or master branch, skipping Artifactory upload"
  exit 0
fi

# Upload to Artifactory.
# NB: For some reason, Docker doesn't detect the `sig-arm` host correctly, so it must be mapped to its IP address.
podman build -t epic-ui-artifact-upload-$HASH -f ./docker/artifact-upload.Dockerfile .
if podman ps -a --format '{{.Names}}' | grep -q "^epic-ui-artifact-upload-$HASH$"; then
  podman rm -f epic-ui-artifact-upload-$HASH
fi
podman run \
  --rm \
  --name epic-ui-artifact-upload-$HASH \
  --add-host sd-artifactory:128.244.106.23 \
  epic-ui-artifact-upload-$HASH \
  mvn -U clean deploy -DskipTests=true -Drepo.password=$1
