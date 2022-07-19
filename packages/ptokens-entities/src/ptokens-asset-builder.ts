import { pTokensAsset } from './ptokens-asset'
import { ChainId, Blockchain, Network, chainIdToBlockchain } from './constants'

export abstract class pTokensAssetBuilder {
  protected name: string
  protected symbol: string
  protected weight: number
  protected network: Network
  protected blockchain: Blockchain
  protected chainId: ChainId

  setName(name: string) {
    this.name = name
    return this
  }

  setSymbol(symbol: string) {
    this.symbol = symbol
    return this
  }

  setWeight(weight: number) {
    this.weight = weight
    return this
  }

  setBlockchain(chainId: ChainId) {
    this.chainId = chainId
    const { blockchain, network } = chainIdToBlockchain.get(chainId)
    this.blockchain = blockchain
    this.network = network
    return this
  }

  abstract build(): pTokensAsset
}
