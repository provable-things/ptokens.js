import { BlockchainType } from 'ptokens-constants'
import { pTokensAsset, pTokensAssetProvider, pTokenAssetConfig } from 'ptokens-entities'
import PromiEvent from 'promievent'

export class pTokensProviderMock implements pTokensAssetProvider {
  waitForTransactionConfirmation(_txHash: string): Promise<string> {
    return Promise.resolve(_txHash)
  }
}

export type pTokenAssetMockConfig = pTokenAssetConfig & {
  /** An pTokensAlgorandProvider for interacting with the underlaying blockchain */
  provider?: pTokensProviderMock
}
export class pTokenAssetMock extends pTokensAsset {
  private _provider: pTokensProviderMock

  get provider() {
    return this._provider
  }

  constructor(_config: pTokenAssetMockConfig) {
    super(_config, BlockchainType.EVM)
    if (_config.provider) this._provider = _config.provider
  }

  swap(): PromiEvent<string> {
    const promi = new PromiEvent<string>((resolve) =>
      setImmediate(() => {
        promi.emit('depositAddress', 'deposit-address')
        promi.emit('txBroadcasted', 'originating-tx-hash')
        promi.emit('txConfirmed', 'originating-tx-hash')
        resolve('originating-tx-hash')
      })
    )
    return promi
  }
}

export class pTokenAssetFailingMock extends pTokensAsset {
  private _provider: pTokensProviderMock

  get provider() {
    return this._provider
  }

  constructor(_config: pTokenAssetMockConfig) {
    super(_config, BlockchainType.EVM)
    if (_config.provider) this._provider = _config.provider
  }

  swap(): PromiEvent<string> {
    const promi = new PromiEvent<string>((resolve, reject) =>
      setImmediate(() => {
        promi.emit('depositAddress', 'deposit-address')
        promi.emit('txBroadcasted', 'originating-tx-hash')
        return reject(new Error('swap error'))
      })
    )
    return promi
  }
}
