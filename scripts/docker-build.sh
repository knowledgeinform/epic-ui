# Please run this script from the root UI project directory.


# Build the UI.
docker container rm epic-ui-builder || true
docker build --build-arg NG_CONFIGURATION="production" -t epic-ui-builder -f ./docker/Dockerfile .
docker create --name epic-ui-builder -i epic-ui-builder

# Copy the built files.
OUTDIR="./dist/EPIC"
rm -rf $OUTDIR
mkdir -p $OUTDIR
docker cp epic-ui-builder:/workspace/dist/EPIC/. $OUTDIR

# Clean-up.
docker container rm epic-ui-builder || true
