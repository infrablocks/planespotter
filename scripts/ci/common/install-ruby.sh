#!/usr/bin/env bash

[ -n "$DEBUG" ] && set -x
set -e
set -o pipefail

apk \
    --update-cache \
    add \
        ca-certificates \
        ruby=2.7.5-r0 \
        ruby-bundler \
        ruby-json

echo 'gem: --no-document' > /etc/gemrc
