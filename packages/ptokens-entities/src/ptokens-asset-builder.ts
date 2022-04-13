import { pTokensAsset } from './ptokens-asset'

export abstract class pTokensAssetBuilder {
  name: string
  networkType: string
  blockchain: string

  setName(name: string) {
    this.name = name
  }

  setNetworkType(networkType: string) {
    this.networkType = networkType
  }

  setBlockchain(blockchain: string) {
    this.blockchain = blockchain
  }

  abstract build(): pTokensAsset
}
