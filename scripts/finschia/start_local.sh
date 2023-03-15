#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

SCRIPT_DIR="$(realpath "$(dirname "$0")")"
LBMAPP_DIR=".lbm"
CONFIG_DIR="${SCRIPT_DIR}/template/${LBMAPP_DIR}"
echo "SCRIPT_DIR: ${SCRIPT_DIR}"
echo "CONFIG_DIR: ${CONFIG_DIR}"

if [ ! -x "$SCRIPT_DIR/test_chain_data" ]; then
  mkdir "$SCRIPT_DIR/test_chain_data"
  cp -R "${CONFIG_DIR}" "${SCRIPT_DIR}/test_chain_data"
fi

lbm start --trace --home "${SCRIPT_DIR}/test_chain_data/${LBMAPP_DIR}"
