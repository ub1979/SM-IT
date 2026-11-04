#!/usr/bin/env bash

docker kill tl-smp || true 
docker rm tl-smp || true 
docker create --name tl-smp -p 3000:3000 -p 4200:4200 localhost/tl-smp
