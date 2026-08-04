#!/bin/tcsh
#
# Deploy EPIC-UI Containers
#

if ($#argv != 1) then
   echo "Usage: deployUI.csh <version> \n"
   goto done
endif

set user = `whoami`
set host = `hostname`

if ($host == "epic-dev" || $host == "epic-dev.jhuapl.edu") then
    if ($user != "epicuser") then
        echo "To run this script you need to be logged in as the 'epicuser' user!"
        exit 1
    endif

    else
      if ($host == "epic-dev2" || $host == "epic-dev2.jhuapl.edu") then
        if ($user != "epicuser") then
          echo "To run this script you need to be logged in as the 'epicuser' user!"
          exit 1
        endif

    else
      if ($host == "epic-test" || $host == "epic-test.jhuapl.edu") then
        if ($user != "epicuser") then
          echo "To run this script you need to be logged in as the 'epicuser' user!"
          exit 1
        endif

    else
       if ($host == "epic" || $host == "epic.jhuapl.edu") then
         if ($user != "epicuser") then
           echo "To run this script you need to be logged in as the 'epicuser' user!"
           exit 1
         endif
       endif
    endif
endif
endif

# Setup Certificates for HTTPS
set certDir = /project/epic/certs

# Set API port, default to 3000. Consider making this an environment variable
set port = 3000

# Set up environment
setenv GSW_CONFIG /project/epic/config

# Create config directory
mkdir -p /project/epic/config/ui

# Stop and remove existing UI
podman stop epic-ui
podman rm epic-ui

# Pull to ensure we are using the latest version
podman pull sd-artifactory.jhuapl.edu/sig-docker-local/scaide/epic/epic-ui:$1

# Run container
podman run -d \
  --name epic-ui \
  --network=host \
  -e API_URL="https://${host}:${port}/EPIC-WS/resources" \
  -e NODE_EXTRA_CA_CERTS="/etc/ssl/certs/JHUAPL-MS-Root-CA-05-21-2038-B64-text.cer" \
  -v ${certDir}:/etc/ssl/certs:ro \
  -v /project/epic:/project/epic \
  -p 8443:8443 \
  sd-artifactory.jhuapl.edu/sig-docker-local/scaide/epic/epic-ui:${1}

done:
  exit 0
