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

export const RouterAddress = new Map<NetworkId, string>([
  [NetworkId.SepoliaTestnet, '0x009B71922e2d52CE013df4a380B29A33aF7B3894'],
  [NetworkId.GoerliTestnet, '0x4968E180f5f26c0109E37B86cAf070627105e041'],
  [NetworkId.ArbitrumMainnet, '0x6DEad6070e7165bf389319762512e5743831E353'],
  [NetworkId.GnosisMainnet, '0x40088126dDBFd5508cdb33285451161aCbdA6C56'],
])

export const StateManagerAddress = new Map<NetworkId, string>([
  [NetworkId.SepoliaTestnet, '0x7E1E6846B183E9AE65Fd95e8262811A29175A9eD'],
  [NetworkId.GoerliTestnet, '0xCE22B9ba226B5d851d86c983656a9008FeC25193'],
  [NetworkId.ArbitrumMainnet, '0xf84552a4B276B47718b8E25E8151eF749D64C4A6'],
  [NetworkId.GnosisMainnet, '0xa3C4398244591841bCe776EC7F8D9E7741B9F934'],
])
