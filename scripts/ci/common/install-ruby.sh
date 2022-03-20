#!/usr/bin/env bash

[ -n "$DEBUG" ] && set -x
set -e
set -o pipefail

apk \
  --update-cache \
  add --no-cache \
    bzip2 \
    ca-certificates \
    gmp-dev \
    libffi-dev \
    procps \
    yaml-dev \
    zlib-dev

mkdir -p /usr/local/etc;
{
  echo 'install: --no-document';
  echo 'update: --no-document';
} >> /usr/local/etc/gemrc

LANG=C.UTF-8
RUBY_MAJOR=3.1
RUBY_VERSION=3.1.1
RUBY_DOWNLOAD_SHA256=7aefaa6b78b076515d272ec59c4616707a54fc9f2391239737d5f10af7a16caa

# some of ruby's build scripts are written in ruby
#   we purge system ruby later to make sure our final image uses what we just built
# readline-dev vs libedit-dev: https://bugs.ruby-lang.org/issues/11869 and https://github.com/docker-library/ruby/issues/75
apk \
  --update-cache \
    add --no-cache --virtual .ruby-builddeps \
    autoconf \
    bison \
    bzip2 \
    bzip2-dev \
    ca-certificates \
    coreutils \
    dpkg-dev dpkg \
    g++ \
    gcc \
    gdbm-dev \
    glib-dev \
    libc-dev \
    libffi-dev \
    libxml2-dev \
    libxslt-dev \
    linux-headers \
    make \
    ncurses-dev \
    openssl \
    openssl-dev \
    patch \
    procps \
    readline-dev \
    ruby \
    tar \
    xz \
    yaml-dev \
    zlib-dev

wget -O ruby.tar.xz "https://cache.ruby-lang.org/pub/ruby/${RUBY_MAJOR%-rc}/ruby-$RUBY_VERSION.tar.xz"
echo "$RUBY_DOWNLOAD_SHA256 *ruby.tar.xz" | sha256sum --check --strict

mkdir -p /usr/src/ruby
tar -xJf ruby.tar.xz -C /usr/src/ruby --strip-components=1
rm ruby.tar.xz

cd /usr/src/ruby

# https://github.com/docker-library/ruby/issues/196
# https://bugs.ruby-lang.org/issues/14387#note-13 (patch source)
# https://bugs.ruby-lang.org/issues/14387#note-16 ("Therefore ncopa's patch looks good for me in general." -- only breaks glibc which doesn't matter here)
wget -O 'thread-stack-fix.patch' 'https://bugs.ruby-lang.org/attachments/download/7081/0001-thread_pthread.c-make-get_main_stack-portable-on-lin.patch'
echo '3ab628a51d92fdf0d2b5835e93564857aea73e0c1de00313864a94a6255cb645 *thread-stack-fix.patch' | sha256sum --check --strict
patch -p1 -i thread-stack-fix.patch
rm thread-stack-fix.patch

# the configure script does not detect isnan/isinf as macros
export ac_cv_func_isnan=yes ac_cv_func_isinf=yes

# hack in "ENABLE_PATH_CHECK" disabling to suppress:
#   warning: Insecure world writable dir
{
  echo '#define ENABLE_PATH_CHECK 0'
  echo
  cat file.c
} > file.c.new
mv file.c.new file.c

autoconf
gnuArch="$(dpkg-architecture --query DEB_BUILD_GNU_TYPE)"
./configure \
  --build="$gnuArch" \
  --disable-install-doc \
  --enable-shared

make -j "$(nproc)"
make install

runDeps="$( \
  scanelf --needed --nobanner --format '%n#p' --recursive /usr/local \
    | tr ',' '\n' \
    | sort -u \
    | awk 'system("[ -e /usr/local/lib/" $1 " ]") == 0 { next } { print "so:" $1 }' \
)"
apk add --no-network --virtual .ruby-rundeps $runDeps
apk del --no-network .ruby-builddeps

cd /
rm -r /usr/src/ruby
# verify we have no "ruby" packages installed
if \
  apk --no-network list --installed \
    | grep -v '^[.]ruby-rundeps' \
    | grep -i ruby; then
  exit 1
fi

[ "$(command -v ruby)" = '/usr/local/bin/ruby' ]
# rough smoke test
ruby --version
gem --version
bundle --version

{
  echo "export GEM_HOME=/usr/local/bundle"
  # don't create ".bundle" in all our apps
  echo "export BUNDLE_SILENCE_ROOT_WARNING=1"
  echo 'export BUNDLE_APP_CONFIG=/usr/local/bundle'
  echo 'export PATH $GEM_HOME/bin:$PATH'
} >> "$BASH_ENV"

# adjust permissions of a few directories for running "gem install" as an arbitrary user
mkdir -p "$GEM_HOME" && chmod 777 "$GEM_HOME"
