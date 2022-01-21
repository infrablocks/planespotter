#!/usr/bin/env sh

[ -n "$DEBUG" ] && set -x
set -e
set -o pipefail

apk \
    --update-cache \
    add \
        ca-certificates \
        ruby=2.7.5 \
        ruby-bundler \
        ruby-json

echo 'gem: --no-document' > /etc/gemrc
