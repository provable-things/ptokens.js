import { pTokensAsset } from 'ptokens-entities'
import PromiEvent from 'promievent'

export class pTokenAssetMock extends pTokensAsset {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  nativeToInterim(): PromiEvent<string> {
    const promi = new PromiEvent<string>((resolve) =>
      setImmediate(() => {
        promi.emit('txBroadcasted', 'originating-tx-hash')
        promi.emit('txConfirmed', 'originating-tx-hash')
        resolve('originating-tx-hash')
      })
    )
    return promi
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
