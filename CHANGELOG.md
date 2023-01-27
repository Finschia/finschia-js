# CHANGELOG

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- [\#61](https://github.com/line/lbmjs/pull/61) @lbmjs/finschia: Add query minimum gas price
- [\#58](https://github.com/line/lbmjs/pull/58) @lbmjs/finschia: Add test foundation amino
### Changed

### Deprecated

### Removed

### Fixed

### Security


## [v0.7.1] - 2023-01-10

### Fixed
- [\#54](https://github.com/line/lbmjs/pull/54) @lbmjs/finschia: Fix not to import wrong execute msg


## [v0.7.0] - 2022-12-08

### Added
- [\#44](https://github.com/line/lbmjs/pull/44) @lbmjs/finshia: Add amino messages to lbm specific modules, support changed foundation module
- [\#47](https://github.com/line/lbmjs/pull/47) @lbmjs/finshia: Add message encode object interface to token, collection, foundation module

### Removed
- [\#43](https://github.com/line/lbmjs/pull/43) chore: remove unused scripts and ci files

### Fixed
- [\#49](https://github.com/line/lbmjs/pull/49) fix: change not to override rpc server address as 26657


## [v0.4.0] - 2022-10-07

- bump up @cosmjs v0.29
- support lbm v0.6.0
- support lbm-sdk v0.46.0-rc8

### Added
- [\#18](https://github.com/line/lbmjs/pull/18) ci: add unittest CI
- [\#35](https://github.com/line/lbmjs/pull/35) ci: run simapp and enable simapp test in GitHub action

### Changed
- [\#20](https://github.com/line/lbmjs/pull/20) cosmjs: bump up v0.28.1
- [\#22](https://github.com/line/lbmjs/pull/22) cosmjs: bump up v0.28.4
- [\#37](https://github.com/line/lbmjs/pull/37) merge stargate and cosmwasm-stargate into finschia
- [\#39](https://github.com/line/lbmjs/pull/39) delete stargate, cosmwasm-stargate
- [\#38](https://github.com/line/lbmjs/pull/38) support lbm-sdk-rc8 and bump up cosmjs 0.29
  - add token/collection/foundation module APIs

### Fixed
- [\#19](https://github.com/line/lbmjs/pull/19) @lbmjs/stargate: fix multisignature spec file error


## 0.1.0 - 2022-03-29

- porting @cosmjs v0.27.1
- support lbm v0.3.0


### Added

- @lbmjs/stargate: Add `x/token` module apis ([#7])
- @lbmjs/cosmwasm-stargate: Add `MsgStoreCodeAndInstantiateContract` function and `MsgUpdateContractStatus` tx encoding ([#7])

### Changed

- @lbmjs/amino: porting @cosmjs/amino v0.27.1 ([#7])
- @lbmjs/cosmwasm-stargate: porting @cosmjs/stargate v0.27.1 ([#7])
- @lbmjs/faucet: porting @cosmjs/faucet v0.27.1 ([#7])
- @lbmjs/faucet-client: porting @cosmjs/faucet v0.27.1 ([#7])
- @lbmjs/ostracon-rpc: porting @cosmjs/tendermint-rpc v0.27.1 ([#7])
- @lbmjs/proto-signing: porting @cosmjs/proto-signing v0.27.1 ([#7])
- @lbmjs/stargate: porting @cosmjs/stargate v0.27.1 ([#7])
- @lbmjs/faucet: support big number ([#14])

[#7]: https://github.com/line/lbmjs/pull/7
[#14]: https://github.com/line/lbmjs/pull/14


[Unreleased]: https://github.com/line/lbmjs/compare/v0.7.1...HEAD
[v0.7.1]: https://github.com/line/lbmjs/compare/v0.7.0...v0.7.1
[v0.7.0]: https://github.com/line/lbmjs/compare/v0.4.0...v0.7.0
[v0.4.0]: https://github.com/line/lbmjs/compare/v0.1.0...v0.4.0
