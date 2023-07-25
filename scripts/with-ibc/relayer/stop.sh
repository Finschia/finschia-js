#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

SCRIPT_DIR="$(realpath "$(dirname "$0")")"
# shellcheck disable=SC1091
# shellcheck source=./env
source "$SCRIPT_DIR"/env

if [ "$( docker container inspect -f '{{.State.Running}}' "$CONTAINER_NAME" )" == "true" ]; then
  echo "Killing finschia container..."
  docker container kill "$CONTAINER_NAME"
fi
