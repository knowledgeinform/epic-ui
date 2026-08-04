# Please run this script from the root UI project directory.


# Build the UI.
./scripts/docker-build.sh

# Get Wario.
git clone --depth 1 --branch v2.0 https://sd-bitbucket.jhuapl.edu/scm/sg/wario.git ../wario

# Build and Start Wario.
warioName="wario-epic"
(
  cd ../wario
  docker build \
    -t $warioName \
    -f ./docker/Dockerfile \
    .
)
docker container rm $warioName || true
docker run -d --name $warioName $warioName

# Copy built UI project into Wario
docker cp ./dist/EPIC/. $warioName:/wario/src/main/webapp

# Build WAR with Wario!
buildName="EPIC"
docker exec $warioName mvn clean install -Dname=EPIC -DgroupId=edu.jhuapl.sd.sig -DartifactId=$buildName -Dversion=1.0-SNAPSHOT -DfinalName=$buildName
docker cp $warioName:/wario/target/$buildName.war ../

# Stop Wario & clean up.
docker stop $warioName
docker image rm -f $warioName

# Output WARs will be in parent dir.
