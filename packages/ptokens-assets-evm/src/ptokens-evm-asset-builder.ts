import { pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensEvmAsset } from './ptokens-evm-asset'
import Web3 from 'web3'

export class pTokensEvmAssetBuilder extends pTokensAssetBuilder {
  private provider: Web3

  constructor() {
    super()
  }

  setProvider(provider: Web3) {
    this.provider = provider
  }

  build(): pTokensEvmAsset {
    if (!this.chainId) throw new Error('Missing chain ID')
    if (!this.provider) throw new Error('Missing provider')
    const config = {
      symbol: this.symbol,
      chainId: this.chainId,
      blockchain: this.blockchain,
      network: this.network,
      provider: this.provider,
    }
    return new pTokensEvmAsset(config)
  }
}
