#!/usr/bin/env bash
set -ex

mode="mainnet"

SCRIPT_DIR="$(realpath "$(dirname "$0")")"
# shellcheck source=./env
# shellcheck disable=SC1091
source "$SCRIPT_DIR"/../env

CHAIN_ID="simd-testing"
MONIKER="simd-testing"
CONFIG_DIR=${SCRIPT_DIR}/.simapp

if [[ $1 == "docker" ]]
then
    if [[ $2 == "testnet" ]]
    then
        mode="testnet"
    fi
    SIMD="docker run -i --rm -p 26656:26656 -p 26657:26657 -v $CONFIG_DIR:/root/.simapp --platform=linux/amd64 $REPOSITORY:$VERSION simd"
elif [[ $1 == "testnet" ]]
then
    mode="testnet"
fi

SIMD=${SIMD:-simd}

# initialize
rm -rf $CONFIG_DIR

# Initialize configuration files and genesis file
# moniker is the name of your node
${SIMD} init solo --chain-id=$CHAIN_ID

# configure for testnet
if [[ ${mode} == "testnet" ]]
then
    if [[ $1 == "docker" ]]
    then
        docker run -i -p 26656:26656 -p 26657:26657 -v ${HOME}/.simapp:/root/.simapp $REPOSITORY:$VERSION sh -c "export SIMD_TESTNET=true"
    else
       export LBM_TESTNET=true
    fi
fi

# Please do not use the TEST_MNEMONIC for production purpose
TEST_MNEMONIC="mind flame tobacco sense move hammer drift crime ring globe art gaze cinnamon helmet cruise special produce notable negative wait path scrap recall have"

${SIMD} keys add add00 --keyring-backend=test --recover --index=0 <<< ${TEST_MNEMONIC}
${SIMD} keys add add01 --keyring-backend=test --recover --index=1 <<< ${TEST_MNEMONIC}
${SIMD} keys add add02 --keyring-backend=test --recover --index=2 <<< ${TEST_MNEMONIC}
${SIMD} keys add add03 --keyring-backend=test --recover --index=3 <<< ${TEST_MNEMONIC}
${SIMD} keys add add04 --keyring-backend=test --recover --index=4 <<< ${TEST_MNEMONIC}
${SIMD} keys add add05 --keyring-backend=test --recover --index=5 <<< ${TEST_MNEMONIC}
${SIMD} keys add add06 --keyring-backend=test --recover --index=6 <<< ${TEST_MNEMONIC}
${SIMD} keys add add07 --keyring-backend=test --recover --index=7 <<< ${TEST_MNEMONIC}
${SIMD} keys add add08 --keyring-backend=test --recover --index=8 <<< ${TEST_MNEMONIC}
${SIMD} keys add multisig0 --keyring-backend=test --multisig add00,add01,add02,add03,add04 --multisig-threshold 2
${SIMD} keys add validator0 --keyring-backend=test --recover --account=1 <<< ${TEST_MNEMONIC}


# Add both accounts, with coins to the genesis file
${SIMD} add-genesis-account $(${SIMD} keys show add00 -a --keyring-backend=test) 100000000000cony,20000000000stake
${SIMD} add-genesis-account $(${SIMD} keys show add01 -a --keyring-backend=test) 100000000000cony,20000000000stake
${SIMD} add-genesis-account $(${SIMD} keys show add02 -a --keyring-backend=test) 100000000000cony,20000000000stake
${SIMD} add-genesis-account $(${SIMD} keys show add03 -a --keyring-backend=test) 100000000000cony,20000000000stake
${SIMD} add-genesis-account $(${SIMD} keys show add04 -a --keyring-backend=test) 100000000000cony,20000000000stake
${SIMD} add-genesis-account $(${SIMD} keys show add05 -a --keyring-backend=test) 100000000000cony,20000000000stake
${SIMD} add-genesis-account $(${SIMD} keys show add06 -a --keyring-backend=test) 100000000000cony,20000000000stake
${SIMD} add-genesis-account $(${SIMD} keys show add07 -a --keyring-backend=test) 100000000000cony,20000000000stake
${SIMD} add-genesis-account $(${SIMD} keys show add08 -a --keyring-backend=test) 100000000000cony,20000000000stake
${SIMD} add-genesis-account $(${SIMD} keys show multisig0 -a --keyring-backend=test) 100000000000cony,20000000000stake
${SIMD} add-genesis-account $(${SIMD} keys show validator0 -a --keyring-backend=test) 100000000000cony,20000000000stake

${SIMD} gentx validator0 10000000000stake --keyring-backend=test --chain-id=$CHAIN_ID --moniker=$MONIKER

${SIMD} collect-gentxs

${SIMD} validate-genesis

# ${SIMD} start --log_level *:debug --rpc.laddr=tcp://0.0.0.0:26657 --p2p.laddr=tcp://0.0.0.0:26656
