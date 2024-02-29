export enum ChainId {
  EthereumMainnet = '0x005fe7f9',
  BitcoinMainnet = '0x01ec97de',
  BitcoinTestnet = '0x018afeb2',
  EosMainnet = '0x02e7261c',
  TelosMainnet = '0x028c7109',
  BscMainnet = '0x00e4b170',
  XdaiMainnet = '0x00f1918e',
  PolygonMainnet = '0x0075dd4c',
  UltraMainnet = '0x02f9337d',
  ArbitrumMainnet = '0x00ce98c4',
  LuxochainMainnet = '0x00d5beb0',
  FantomMainnet = '0x0022af98',
  AlgorandMainnet = '0x03c38e67',
  LibreMainnet = '0x026776fa',
  LitecoinMainnet = '0x01840435',
}

export enum BlockchainType {
  EVM,
  EOSIO,
  UTXO,
  ALGORAND,
}

export const chainIdToTypeMap = new Map<string, BlockchainType>([
  [ChainId.EthereumMainnet, BlockchainType.EVM],
  [ChainId.BitcoinMainnet, BlockchainType.UTXO],
  [ChainId.BitcoinTestnet, BlockchainType.UTXO],
  [ChainId.EosMainnet, BlockchainType.EOSIO],
  [ChainId.TelosMainnet, BlockchainType.EOSIO],
  [ChainId.BscMainnet, BlockchainType.EVM],
  [ChainId.XdaiMainnet, BlockchainType.EVM],
  [ChainId.PolygonMainnet, BlockchainType.EVM],
  [ChainId.UltraMainnet, BlockchainType.EOSIO],
  [ChainId.ArbitrumMainnet, BlockchainType.EVM],
  [ChainId.LuxochainMainnet, BlockchainType.EVM],
  [ChainId.FantomMainnet, BlockchainType.EVM],
  [ChainId.AlgorandMainnet, BlockchainType.ALGORAND],
  [ChainId.LibreMainnet, BlockchainType.EOSIO],
  [ChainId.LitecoinMainnet, BlockchainType.UTXO],
])

export enum Blockchain {
  Ethereum,
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

export enum TokenAddresses {
  PTLOS_ON_ETH = '0x7825e833d495f3d1c28872415a4aee339d26ac88',
  PIQ_ON_ETH = '0xa23d33d5e0a61ba81919bfd727c671bb03ab0fea',
  PLTC_ON_ETH = '0x5979f50f1d4c08f9a53863c2f39a7b0492c38d0f',
  PNT_ON_XDAI = '0x0259461eed4d76d4f0f900f9035f6c4dfb39159a',
}
