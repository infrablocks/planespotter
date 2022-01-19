#!/usr/bin/env sh

[ -n "$DEBUG" ] && set -x
set -e
set -o pipefail

apk \
    --update-cache \
    add \
        git-crypt \
        gnupg \
        openssl
