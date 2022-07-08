import { pTokensAsset, pTokenAssetConfig } from 'ptokens-entities'
import * as utils from 'ptokens-utils'
import PromiEvent from 'promievent'
import Web3 from 'web3'

export type pTokenEvmAssetConfig = pTokenAssetConfig & { provider?: Web3 }
export class pTokensEvmAsset extends pTokensAsset {
  private provider: Web3

  constructor(config: pTokenEvmAssetConfig) {
    super(config)
    this.provider = config.provider
  }

  nativeToInterim(): PromiEvent<string> {
    const promi = new PromiEvent<string>((resolve) => {
      resolve('')
    })
    return promi
  }
  hostToInterim(): PromiEvent<string> {
    const promi = new PromiEvent<string>((resolve) => {
      resolve('')
    })
    return promi
  }
}
