#!/bin/bash

# This must get from 2-3 different repos, fix the versions here:

COSMWASM_VERSION="v1.0.0-0.6.0"

curl -sS -L -O "https://github.com/Finschia/cosmwasm/releases/download/${COSMWASM_VERSION}/hackatom.wasm"
curl -sS -L -O "https://github.com/Finschia/cosmwasm/releases/download/${COSMWASM_VERSION}/ibc_reflect.wasm"

sha256sum *.wasm > checksums.sha256
