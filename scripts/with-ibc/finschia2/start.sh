#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

# Please keep this in sync with the Ports overview in HACKING.md
TENDERMINT_PORT_GUEST="26657"
TENDERMINT_PORT_HOST="26557"
API_PORT_GUEST="1317"
API_PORT_HOST="1318"
GRPC_PORT_GUEST="9090"
GRPC_PORT_HOST="9091"

SCRIPT_DIR="$(realpath "$(dirname "$0")")"
# shellcheck disable=SC1091
# shellcheck source=env
source "${SCRIPT_DIR}"/env

TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/fnsa.XXXXXXXXX")
chmod 777 "$TMP_DIR"
echo "Using temporary dir $TMP_DIR"
FINSCHIA_LOGFILE="$TMP_DIR/finschia2.log"

# Use a fresh volume for every start
docker volume rm -f fnsad2_data

docker run --rm \
  --name "$CONTAINER_NAME" \
  -p "$TENDERMINT_PORT_HOST":"$TENDERMINT_PORT_GUEST" \
  -p "$API_PORT_HOST":"$API_PORT_GUEST" \
  -p "$GRPC_PORT_HOST":"$GRPC_PORT_GUEST" \
  --mount type=bind,source="$SCRIPT_DIR/template",target=/template \
  --mount type=volume,source=fnsad2_data,target=/root \
  "$REPOSITORY:$VERSION" \
  /template/run_finschia.sh \
  >"$FINSCHIA_LOGFILE" 2>&1 &

echo "fnsad running on http://localhost:$TENDERMINT_PORT_HOST and logging into $FINSCHIA_LOGFILE"

if [ -n "${CI:-}" ]; then
  # Give process some time to come alive. No idea why this helps. Needed for CI.
  sleep 0.5

  # Follow the logs in CI's background job
  tail -f "$FINSCHIA_LOGFILE"
fi
