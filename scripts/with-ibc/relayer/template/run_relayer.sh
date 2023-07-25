#!/bin/sh
# shellcheck disable=SC3040
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

file_path=".relayer/config/config.yaml"

if [ -f "$file_path" ]; then
  echo "The file $file_path exists."
else
  echo "The file $file_path does not exist."

  TEST_MNEMONIC="mind flame tobacco sense move hammer drift crime ring globe art gaze cinnamon helmet cruise special produce notable negative wait path scrap recall have"
  COINID=438

  echo "Generating rly configurations..."
  rly config init
  rly chains add-dir /template/configs/chains

  echo "Key $(rly keys restore finschia-0 testkey2 "$TEST_MNEMONIC" --coin-type $COINID) imported from finschia-0 to relayer..."
  echo "Key $(rly keys restore finschia2-0 testkey2 "$TEST_MNEMONIC" --coin-type $COINID) imported from finschia2-0 to relayer..."

  rly paths add-dir /template/configs/paths

  rly tx link finschia-finschia -d -t 3s
fi

rly start finschia-finschia
