import { pTokensAsset } from './ptokens-asset'

export abstract class pTokensAssetBuilder {
  protected name: string
  protected symbol: string
  protected weight: number
  protected network: string
  protected blockchain: string
  protected chainId: string
  protected destinationAddress: string

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

  setNetwork(network: string) {
    this.network = network
    return this
  }

  setBlockchain(blockchain: string) {
    this.blockchain = blockchain
    return this
  }

  setChainId(chainId: string) {
    this.chainId = chainId
    return this
  }

  setDestinationAddress(destinationAddress: string) {
    this.destinationAddress = destinationAddress
    return this
  }

  abstract build(): pTokensAsset
}
