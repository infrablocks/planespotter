#!/usr/bin/env bash

[ -n "$DEBUG" ] && set -x
set -e
set -o pipefail

apk \
    --update-cache \
    add \
        curl \
        jq
