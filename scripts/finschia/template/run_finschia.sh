#!/bin/sh
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

cp -R "/template/.finschia" /root/.finschia
mkdir -p /root/log
fnsad start --rpc.laddr tcp://0.0.0.0:26658 --trace
