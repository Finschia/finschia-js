# Local simd development network

## Starting the blockchain

Run the following:

```npm
npm run build
```

```shell
cd scripts/finschia
./start.sh
./init.sh
```

## How to change and generate default genesis and configurations

1. change the docker image you want in the `./scripts/finschia/env` file.
2. cd `./scripts/finschia/template`.
3. execute `setup.sh docker`.
4. check the difference of `app.toml`, `client.toml`, `config.toml` and
   `genesis.json` in the `./script/finschia/template/.finschia/config` directory
   and select the code you want.
