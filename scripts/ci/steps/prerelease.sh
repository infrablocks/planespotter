#!/usr/bin/env bash

[ -n "$DEBUG" ] && set -x
set -e
set -o pipefail

git crypt unlock

npm run version:bump:pre

./go docker:publish

git status
git push --all
git push --tags
