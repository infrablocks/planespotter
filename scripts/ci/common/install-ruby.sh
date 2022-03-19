#!/usr/bin/env bash

[ -n "$DEBUG" ] && set -x
set -e
set -o pipefail

RBENV_ROOT=/usr/local/rbenv
RUBY_VERSION=3.1.1
CONFIGURE_OPTS=--disable-install-doc

export CONFIGURE_OPTS

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

git clone --depth 1 git@github.com/sstephenson/rbenv.git ${RBENV_ROOT}
git clone --depth 1 git@github.com/sstephenson/ruby-build.git ${RBENV_ROOT}/plugins/ruby-build
git clone --depth 1 git@github.com/jf/rbenv-gemset.git ${RBENV_ROOT}/plugins/rbenv-gemset

${RBENV_ROOT}/plugins/ruby-build/install.sh

# shellcheck disable=SC2016
echo 'eval "$(rbenv init -)"' >> /etc/profile.d/rbenv.sh

rbenv install $RUBY_VERSION
rbenv global $RUBY_VERSION

gem install bundler
