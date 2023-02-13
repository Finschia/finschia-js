# Local simd development network

## Starting the blockchain

Run the following:

```shell
cd scripts/lbm
./start.sh
```

## How to change and generate default genesis and configurations

1. change the docker image you want in the `./scripts/lbm/env` file.
2. cd `./scripts/lbm/template`.
3. execute `setup.sh docker`.
4. check the difference of `app.toml`, `client.toml`, `config.toml` and `genesis.json` in the `./script/lbm/template/.lbm/config` directory and select the code you want.

