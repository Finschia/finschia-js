# CHANGELOG

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- cosmjs: bump up cosmjs from v0.28.1 to v0.28.4  ([#22])
- @lbmjs/stargate: add unimplemented query/tx apis of evidence and feegrant, gov, token ([#23])

### Changed

### Deprecated

### Removed

### Fixed

### Security

[#22]: https://github.com/line/lbmjs/pull/22
[#23]: https://github.com/line/lbmjs/pull/23


## [0.4.0-rc0] - 2022-04-20

- bump up @cosmjs v0.28.1
- support lbm v0.4.0-rc0

### Added
- ci: add unittest CI ([#18])

### Changed
- cosmjs: feat: bump up v0.28.1 ([#20])

### Fixed
- @lbmjs/stargate: fix multisignature spec file error ([#19])

[#18]: https://github.com/line/lbmjs/pull/18
[#19]: https://github.com/line/lbmjs/pull/19
[#20]: https://github.com/line/lbmjs/pull/20


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


[Unreleased]: https://github.com/line/lbmjs/compare/v0.4.0-rc0...HEAD
[v0.4.0-rc0]: https://github.com/line/lbmjs/compare/v0.1.0...v0.4.0-rc0
