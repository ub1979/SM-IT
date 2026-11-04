#!/bin/bash

set -o xtrace

docker rmi localhost/tl-smp || true
docker build --target dist -t localhost/tl-smp -f Dockerfile.dev .
docker build --target devcontainer -t localhost/tl-smp-devcontainer -f Dockerfile.dev .
