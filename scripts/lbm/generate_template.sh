#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

gnused="$(command -v gsed || echo sed)"

SCRIPT_DIR="$(realpath "$(dirname "$0")")"
# shellcheck source=./env
# shellcheck disable=SC1091
source "$SCRIPT_DIR"/env

rm -rf "$SCRIPT_DIR/template"
mkdir "$SCRIPT_DIR/template"
cp setup.sh "$SCRIPT_DIR/template/"
chmod +x "$SCRIPT_DIR/template/setup.sh"
cp run_lbm.sh "$SCRIPT_DIR/template/"
chmod +x "$SCRIPT_DIR/template/run_lbm.sh"

# The usage of the accounts below is documented in README.md of this directory
docker run --rm \
  -e PASSWORD=my-secret-password \
  --mount type=bind,source="$SCRIPT_DIR/template",target=/root \
  "$REPOSITORY:$VERSION" \
  ./setup.sh \
  link1twsfmuj28ndph54k4nw8crwu8h9c8mh3rtx705 link1008wengr28z5quat2dzrprt9h8euav4herfyum link1h82llw7m5rv05nal6nj92ce7wm6tkq4c4xsk99 link1j8m979dwv0rh74ypzdchcmenm9gsyx8ta7r9tz link1hldt6ysh5jhq2lq5d3j9ln9746mmljq48ew2k3 \
  link1xqkg8l2mrh7zfdttkcrnksjxsw92pk6j4xug29 link10tqruu9v6n67gcnlfjx0gtw3z2us9rpfd20ud0 link12sw2gdeetefvpkj9lk5lk85q98x454wh9fvasa link1ta5lxlgc2nu8msrcg53m48gjxf73hcyf3xkjf6 link146asaycmtydq45kxc8evntqfgepagygelel00h

# The ./template folder is created by the docker daemon's user (root on Linux, current user
# when using Docker Desktop on macOS), let's make it ours if needed
if [ ! -x "$SCRIPT_DIR/template/.simapp/config/gentx" ]; then
  sudo chown -R "$(id -u):$(id -g)" "$SCRIPT_DIR/template"
fi

function inline_jq() {
  IN_OUT_PATH="$1"
  shift
  TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/inline_jq.XXXXXXXXX")
  TMP_FILE="$TMP_DIR/$(basename "$IN_OUT_PATH")"
  jq "$@" <"$IN_OUT_PATH" >"$TMP_FILE"
  if ! mv "$TMP_FILE" "$IN_OUT_PATH"; then
    echo >&2 "Temp file '$TMP_FILE' could not be deleted. If it contains sensitive data, you might want to delete it manually."
    exit 3
  fi
}

(
  cd "$SCRIPT_DIR"
  # shellcheck disable=SC2016
  inline_jq "template/.simapp/config/genesis.json" --argjson ibc "$(<genesis-ibc.json)" '.app_state.ibc=$ibc'
  # Sort genesis
  inline_jq "template/.simapp/config/genesis.json" -S

  # Custom settings in config.toml
  "$gnused" -i \
    -e 's/^cors_allowed_origins =.*$/cors_allowed_origins = ["*"]/' \
    -e 's/^timeout_propose =.*$/timeout_propose = "300ms"/' \
    -e 's/^timeout_propose_delta =.*$/timeout_propose_delta = "100ms"/' \
    -e 's/^timeout_prevote =.*$/timeout_prevote = "300ms"/' \
    -e 's/^timeout_prevote_delta =.*$/timeout_prevote_delta = "100ms"/' \
    -e 's/^timeout_precommit =.*$/timeout_precommit = "300ms"/' \
    -e 's/^timeout_precommit_delta =.*$/timeout_precommit_delta = "100ms"/' \
    -e 's/^timeout_commit =.*$/timeout_commit = "1s"/' \
    "template/.simapp/config/config.toml"

  # Custom settings app.toml
  "$gnused" -i \
    -e 's/^enable =.*$/enable = true/' \
    -e 's/^enabled-unsafe-cors =.*$/enabled-unsafe-cors = true/' \
    "template/.simapp/config/app.toml"
)
