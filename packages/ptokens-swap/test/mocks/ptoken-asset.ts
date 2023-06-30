import PromiEvent from 'promievent'
import { BlockchainType } from 'ptokens-constants'
import { pTokensAsset, pTokensAssetProvider, pTokenAssetConfig, SwapResult } from 'ptokens-entities'

export class pTokensProviderMock implements pTokensAssetProvider {
  waitForTransactionConfirmation(_txHash: string): Promise<string> {
    return Promise.resolve(_txHash)
  }
  monitorCrossChainOperations(): PromiEvent<string> {
    const promi = new PromiEvent<string>((resolve) => {
      return resolve('tx-hash')
    })
    return promi
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

  swap(): PromiEvent<SwapResult> {
    const promi = new PromiEvent<SwapResult>((resolve) =>
      setImmediate(() => {
        promi.emit('txBroadcasted', { txHash: 'originating-tx-hash' })
        promi.emit('txConfirmed', { txHash: 'originating-tx-hash', operationId: 'operation-id' })
        resolve({ txHash: 'originating-tx-hash', operationId: 'operation-id' })
      })
    )
    return promi
  }

  protected monitorCrossChainOperations(): PromiEvent<string> {
    const promi = new PromiEvent<string>((resolve) =>
      setImmediate(() => {
        promi.emit('operationQueued', 'operation-queued-tx-hash')
        promi.emit('operationExecuted', 'operation-executed-tx-hash')
        return resolve('operation-executed-tx-hash')
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

  swap(): PromiEvent<SwapResult> {
    const promi = new PromiEvent<SwapResult>((resolve, reject) =>
      setImmediate(() => {
        promi.emit('txBroadcasted', 'originating-tx-hash')
        return reject(new Error('swap error'))
      })
    )
    return promi
  }

  protected monitorCrossChainOperations(): PromiEvent<string> {
    const promi = new PromiEvent<string>((resolve, reject) =>
      setImmediate(() => {
        return reject(new Error('monitorCrossChainOperations error'))
      })
    )
    return promi
  }
}
