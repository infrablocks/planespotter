#!/usr/bin/env sh

[ -n "$DEBUG" ] && set -x
set -e

apk \
    --update-cache \
    add \
        bash
