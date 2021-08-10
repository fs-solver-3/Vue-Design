#!/bin/sh
git checkout staging && git pull

docker build --no-cache -t datainsiderco/rocket-bi-web:staging .
