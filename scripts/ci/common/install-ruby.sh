#!/usr/bin/env bash

[ -n "$DEBUG" ] && set -x
set -e
set -o pipefail

RUBY_VERSION=3.1.1
RBENV_ROOT=/usr/local/rbenv
CONFIGURE_OPTS=--disable-install-doc
PATH=/usr/local/rbenv/shims:/usr/local/rbenv/bin:$PATH

export RBENV_ROOT
export CONFIGURE_OPTS
export PATH

if [[ ! -d "${RBENV_ROOT}" ]]; then
  apk \
      --update-cache \
      add --update \
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

  rbenv install $RUBY_VERSION
  rbenv global $RUBY_VERSION

  gem install bundler
fi

{
  echo "PATH=$PATH"
  echo "RBENV_ROOT=$RBENV_ROOT"
  echo "export PATH"
  echo "export RBENV_ROOT"
} >> "$BASH_ENV"

echo "$BASH_ENV"
cat "$BASH_ENV"
