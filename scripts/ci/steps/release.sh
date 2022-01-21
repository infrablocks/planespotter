#!/usr/bin/env bash

[ -n "$DEBUG" ] && set -x
set -e
set -o pipefail

git crypt unlock
git pull

npm run version:bump:minor

./go docker:publish

npm version:bump:next

git status
git push --all
git push --tags
