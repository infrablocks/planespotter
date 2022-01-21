#!/usr/bin/env sh

[ -n "$DEBUG" ] && set -x
set -e
set -o pipefail

apk \
    --update-cache \
    add \
        ca-certificates \
        ruby=3.0.3 \
        ruby-bundler \
        ruby-json

echo 'gem: --no-document' > /etc/gemrc
