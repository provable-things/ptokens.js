import { pTokensAsset } from 'ptokens-entities'
import PromiEvent from 'promievent'

export class pTokenAssetMock extends pTokensAsset {
  nativeToInterim(): PromiEvent<string> {
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
  hostToInterim(): PromiEvent<string> {
    const promi = new PromiEvent<string>((resolve) =>
      setImmediate(() => {
        promi.emit('txBroadcasted', 'originating-tx-hash')
        promi.emit('txConfirmed', 'originating-tx-hash')
        resolve('originating-tx-hash')
      })
    )
    return promi
  }
}
