#!/bin/tcsh
#
# Deploy EPIC-UI
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


# Check that tomcat is not running.
set tomcatPid = `ps -ef | grep tomcat | grep -v grep | awk '{ print $2 }'`
if ($tomcatPid != "") then
    echo "--Tomcat must be shutdown prior to install--"
    exit 1
endif


# Set up environment
setenv GSW_CONFIG /project/epic/config

#create releases directory if doesn't exist already
mkdir -p /project/epic/releases

# Untar the UI from the tar and create a sym link to tomcat web apps directory
echo "Extracting the UI application and creating symlink"
mkdir -p /project/epic/releases/EPIC-UI-$1
tar -C /project/epic/releases/EPIC-UI-$1 -xvzf EPIC-UI-$1.tar.gz EPIC
rm -f /usr/tomcat/webapps/EPIC
ln -s /project/epic/releases/EPIC-UI-$1/EPIC /usr/tomcat/webapps/EPIC

# Customize configuration files
echo "Editing the configuration file"
set configFile = /usr/tomcat/webapps/EPIC/assets/data/app-config.json
perl -pi -e 's/http/https/' $configFile
perl -pi -e 's/localhost/'$host'/' $configFile
perl -pi -e 's/8080/8443/' $configFile

echo "*************************************"
echo "**** EPIC UI Deployment Complete ****"
echo "****  Remember To Start Tomcat   ****"
echo "*************************************"

done:
	exit 0
