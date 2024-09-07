# Docker command

- Build image: `docker build --progress=plain -t <image_name> -f Dockerfile .`
Ex: `docker build --progress=plain -t taivan/twitter-api:v0 -f Dockerfile .`

- Run container: `docker container run -dp PORT_NGOAI:PORT_TRONG_DOCKER <image_name>`
Ex: `docker container run -dp 3000:3000 taivan/twitter-api:v0`

- Mapping volume: `docker container run -dp PORT_NGOAI:PORT_TRONG_DOCKER -v $(pwd):/app <image_name>`
Ex: `docker container run -dp 3000:3000 -v D:/Workspace/nodejs/nodejs-super/twitter-api/uploads:/app/uploads taivan/twitter-api:v0`