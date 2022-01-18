#!/usr/bin/env bash

[ -n "$DEBUG" ] && set -x
set -e
set -o pipefail

apt-get update

apt-get install -y ruby-full

echo 'gem: --no-document' > /etc/gemrc
