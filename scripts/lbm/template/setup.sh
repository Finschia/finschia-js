#!/usr/bin/env bash
set -ex

mode="mainnet"

SCRIPT_DIR="$(realpath "$(dirname "$0")")"
# shellcheck source=./env
# shellcheck disable=SC1091
source "$SCRIPT_DIR"/../env

CHAIN_ID="simd-testing"
MONIKER="simd-testing"
CONFIG_DIR=${SCRIPT_DIR}/.lbm
CHAIN_DIR=${CONFIG_DIR}

if [[ $1 == "docker" ]]
then
    if [[ $2 == "testnet" ]]
    then
        mode="testnet"
    fi
    LBM="docker run -i --rm -p 26656:26656 -p 26657:26657 -v $CONFIG_DIR:/root/.lbm --platform=linux/amd64 $REPOSITORY:$VERSION lbm"
    CHAIN_DIR="/root/.lbm"
elif [[ $1 == "testnet" ]]
then
    mode="testnet"
fi

LBM=${LBM:-lbm}

# initialize
rm -rf $CONFIG_DIR

# Initialize configuration files and genesis file
# moniker is the name of your node
${LBM} init simd-testing --chain-id=$CHAIN_ID --home=${CHAIN_DIR}

# configure for testnet
if [[ ${mode} == "testnet" ]]
then
    if [[ $1 == "docker" ]]
    then
        docker run -i -p 26656:26656 -p 26657:26657 -v ${HOME}/.lbm:/root/.lbm $REPOSITORY:$VERSION sh -c "export SIMD_TESTNET=true"
    else
       export LBM_TESTNET=true
    fi
fi

# Please do not use the TEST_MNEMONIC for production purpose
TEST_MNEMONIC="mind flame tobacco sense move hammer drift crime ring globe art gaze cinnamon helmet cruise special produce notable negative wait path scrap recall have"
N=9

# generate normal account keys
for ((i = 0; i < N; i++))
do
  ${LBM} keys add account${i} --home=${CHAIN_DIR} --keyring-backend=test --recover --index=${i} <<< ${TEST_MNEMONIC}
done
# generate multisig key
${LBM} keys add multisig0 --home=${CHAIN_DIR} --keyring-backend=test --multisig account0,account1,account2,account3,account4 --multisig-threshold 2
# generate validator key
${LBM} keys add validator0 --home=${CHAIN_DIR} --keyring-backend=test --recover --account=1 <<< ${TEST_MNEMONIC}


# Add both accounts, with coins to the genesis file
for ((i = 0; i < N; i++))
do
  ${LBM} add-genesis-account $(${LBM} keys show account${i} -a --home=${CHAIN_DIR} --keyring-backend=test) 100000000000cony,20000000000stake --home=${CHAIN_DIR}
done
${LBM} add-genesis-account $(${LBM} keys show multisig0 -a --home=${CHAIN_DIR} --keyring-backend=test) 100000000000cony,20000000000stake --home=${CHAIN_DIR}
${LBM} add-genesis-account $(${LBM} keys show validator0 -a --home=${CHAIN_DIR} --keyring-backend=test) 100000000000cony,20000000000stake --home=${CHAIN_DIR}

${LBM} gentx validator0 10000000000stake --home=${CHAIN_DIR} --keyring-backend=test --chain-id=$CHAIN_ID --moniker=$MONIKER

${LBM} collect-gentxs --home=${CHAIN_DIR}

${LBM} validate-genesis --home=${CHAIN_DIR}

# ${LBM} start --log_level *:debug --rpc.laddr=tcp://0.0.0.0:26657 --p2p.laddr=tcp://0.0.0.0:26656
