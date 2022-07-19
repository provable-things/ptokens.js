export enum ChainId {
  EthereumMainnet = '0x005fe7f9',
  EthereumRopsten = '0x0069c322',
  EthereumRinkeby = '0x00f34368',
  BitcoinMainnet = '0x01ec97de',
  BitcoinTestnet = '0x018afeb2',
  EosMainnet = '0x02e7261c',
  TelosMainnet = '0x028c7109',
  BscMainnet = '0x00e4b170',
  EosJungle = '0x0282317f',
  XDaiMainnet = '0x00f1918e',
  PolygonMainnet = '0x0075dd4c',
  UltraMainnet = '0x025d3c68',
  FioMainnet = '0x02174f20',
  UltraTestnet = '0x02b5a4d6',
  ArbitrumMainnet = '0x00ce98c4',
  LuxochainMainnet = '0x00d5beb0',
  FantomMainnet = '0x0022af98',
  AlgorandMainnet = '0x03c38e67',
  LibreTestnet = '0x02a75f2c',
  LibreMainnet = '0x026776fa',
}

export enum BlockchainType {
  EVM,
  EOSIO,
  UTXO,
  ALGORAND,
}

export enum Blockchain {
  Ethereum,
  Bitcoin,
  Eos,
  Telos,
  Bsc,
  XDai,
  Polygon,
  Ultra,
  Fio,
  Arbitrum,
  Luxochain,
  Fantom,
  Algorand,
  Libre,
}

export enum Network {
  Mainnet,
  Testnet,
  Ropsten,
  Rinkeby,
  Jungle,
}

function splitCamelCase(str: string): string[] {
  return str.split(/(?=[A-Z])/)
}

function parseChainIdKey(chainId: ChainId): { blockchain: Blockchain; network: Network } {
  const chainIdKey = Object.keys(ChainId)[Object.values(ChainId).indexOf(chainId)]
  const tokens = splitCamelCase(chainIdKey)
  return { blockchain: Blockchain[tokens[0]], network: Network[tokens[1]] }
}

export const chainIdToBlockchain: Map<ChainId, { blockchain: Blockchain; network: Network }> = new Map(
  Object.values(ChainId).map((_value) => [_value, parseChainIdKey(_value)])
)
