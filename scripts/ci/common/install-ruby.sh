#!/usr/bin/env bash

[ -n "$DEBUG" ] && set -x
set -e
set -o pipefail

RBENV_ROOT=/usr/local/rbenv
RUBY_VERSION=3.1.1
CONFIGURE_OPTS=--disable-install-doc
PATH=/usr/local/rbenv/shims:/usr/local/rbenv/bin:$PATH

export CONFIGURE_OPTS
export PATH

apk \
    --update-cache \
    add --update \
    bash \
    git \
    wget \
    curl \
    vim \
    build-base \
    readline-dev \
    openssl-dev \
    zlib-dev \
    linux-headers \
    imagemagick-dev \
    libffi-dev \
    libffi-dev

rm -rf /var/cache/apk/*

git clone --depth 1 https://github.com/rbenv/rbenv.git ${RBENV_ROOT}
git clone --depth 1 https://github.com/rbenv/ruby-build.git ${RBENV_ROOT}/plugins/ruby-build

${RBENV_ROOT}/plugins/ruby-build/install.sh

# shellcheck disable=SC2016
echo 'eval "$(rbenv init -)"' >> /etc/profile.d/rbenv.sh

rbenv install $RUBY_VERSION
rbenv global $RUBY_VERSION

rbenv which gem

ls -la /usr/local/rbenv/shims
ls -la /usr/local/rbenv/bin

eval "$(rbenv init -)"

gem install bundler
