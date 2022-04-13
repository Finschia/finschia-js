#!/bin/sh
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

SCRIPT_DIR="$(realpath "$(dirname "$0")")"

if [ ! -x "$SCRIPT_DIR/test_chain_data" ]; then
  mkdir "$SCRIPT_DIR/test_chain_data"
  cp -R "$SCRIPT_DIR/template/.lbm" "$SCRIPT_DIR/test_chain_data"
fi

#lbm start --rpc.laddr tcp://0.0.0.0:26657 --trace --home "$SCRIPT_DIR/test_chain_data/.lbm"
lbm start --trace --home "$SCRIPT_DIR/test_chain_data/.lbm"
