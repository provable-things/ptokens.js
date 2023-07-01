export enum NetworkId {
  SepoliaTestnet = '0xe15503e4',
  GoerliTestnet = '0xb9286154',
  ArbitrumMainnet = '0xfc8ebb2b',
  GnosisMainnet = '0xd41b1c5b',
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
  [NetworkId.ArbitrumMainnet, BlockchainType.EVM],
  [NetworkId.GnosisMainnet, BlockchainType.EVM],
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
  Gnosis,
}

export enum Network {
  Mainnet,
  Testnet,
}

export const FactoryAddress = new Map<NetworkId, string>([
  [NetworkId.ArbitrumMainnet, '0x42807B8Bbb9A345E0B8333bc8f0F7e946b724C64'],
  [NetworkId.GnosisMainnet, '0x678eE2CD8e912693aa7933730F2b55c678136c34'],
])
