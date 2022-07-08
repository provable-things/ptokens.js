import { pTokensAsset } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import PromiEvent from 'promievent'
import { Binary } from '@babel/types'

export class pTokenAssetMock extends pTokensAsset {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  nativeToInterim(
    _node: pTokensNode,
    _amount: number,
    _destinationAddress: string,
    _destinationChainId: string,
    _userData?: BinaryData
  ): PromiEvent<string> {
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
  hostToInterim(
    _node: pTokensNode,
    _amount: number,
    _destinationAddress: string,
    _destinationChainId: string,
    _userData?: BinaryData
  ): PromiEvent<string> {
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
