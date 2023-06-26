export enum NetworkId {
  SepoliaTestnet = '0xe15503e4',
  GoerliTestnet = '0xb9286154',
}

export enum BlockchainType {
  EVM,
  EOSIO,
  UTXO,
  ALGORAND,
}

export const networkIdToTypeMap = new Map<string, BlockchainType>([
  [NetworkId.SepoliaTestnet, BlockchainType.EVM],
  [NetworkId.GoerliTestnet, BlockchainType.EVM],
])

export enum Blockchain {
  Ethereum,
  Sepolia,
  Goerli,
  Bitcoin,
  Eos,
  Telos,
  Bsc,
  Xdai,
  Polygon,
  Ultra,
  Fio,
  Arbitrum,
  Luxochain,
  Fantom,
  Algorand,
  Libre,
  Litecoin,
}

export enum Network {
  Mainnet,
  Testnet,
}

export const RouterAddress = new Map<NetworkId, string>([
  [NetworkId.SepoliaTestnet, '0x009B71922e2d52CE013df4a380B29A33aF7B3894'],
  [NetworkId.GoerliTestnet, '0x4968E180f5f26c0109E37B86cAf070627105e041'],
])

export const StateManagerAddress = new Map<NetworkId, string>([
  [NetworkId.SepoliaTestnet, '0x7E1E6846B183E9AE65Fd95e8262811A29175A9eD'],
  [NetworkId.GoerliTestnet, '0xCE22B9ba226B5d851d86c983656a9008FeC25193'],
])
