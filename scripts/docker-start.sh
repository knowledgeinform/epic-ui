# Please run from UI project root.

docker build . -t epic-dev-ui
docker run --rm -it -p 4200:4200 -v "$PWD:/project" epic-dev-ui
