import { pTokensAsset } from 'ptokens-entities'
import { pTokensNode, Status, InnerTransactionStatus } from 'ptokens-node'
import PromiEvent from 'promievent'
import polling from 'light-async-polling'
import BigNumber from 'bignumber.js'

export type DestinationInfo = {
  asset: pTokensAsset
  destinationAddress: string
  userData?: Uint8Array
}

export class pTokensSwap {
  private _node: pTokensNode
  private _sourceAsset: pTokensAsset
  private _destinationAssets: DestinationInfo[]
  private _amount: BigNumber
  private controller: AbortController

  constructor(node: pTokensNode, sourceAsset: pTokensAsset, destinationAssets: DestinationInfo[], amount: BigNumber) {
    this._node = node
    this._sourceAsset = sourceAsset
    this._destinationAssets = destinationAssets
    this._amount = amount
    this.controller = new AbortController()
  }

  get sourceAsset(): pTokensAsset {
    return this._sourceAsset
  }

  get destinationAssets(): pTokensAsset[] {
    return this._destinationAssets.map((_el) => _el.asset)
  }

  get amount(): string {
    return this._amount.toFixed()
  }

  get node(): pTokensNode {
    return this._node
  }

  private monitorInputTransactions(_txHash: string, _origChainId: string): PromiEvent<InnerTransactionStatus[]> {
    const promi = new PromiEvent<InnerTransactionStatus[]>(
      (resolve) =>
        (async () => {
          async function getInputTransactions(node: pTokensNode) {
            const resp = await node.getTransactionStatus(_txHash, _origChainId)
            return resp.inputs
          }
          let resp: InnerTransactionStatus[]
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
          await polling(async () => {
            try {
              resp = await getInputTransactions(this.node)
              if (resp.length) {
                promi.emit('inputTxDetected', resp)
                return true
              }
            } catch (err) {
              return false
            }
          }, 1000)
          resolve(resp)
        })() as unknown
    )
    return promi
  }

  private monitorOutputTransactions(_txHash: string, _origChainId: string): PromiEvent<InnerTransactionStatus[]> {
    const promi = new PromiEvent<InnerTransactionStatus[]>(
      (resolve) =>
        (async () => {
          async function getOutputTransactions(node: pTokensNode) {
            const resp = await node.getTransactionStatus(_txHash, _origChainId)
            return resp.outputs
          }
          let notified = false
          let resp: InnerTransactionStatus[]
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
          await polling(async () => {
            try {
              resp = await getOutputTransactions(this.node)
              if (resp.length && !notified) {
                notified = true
                promi.emit('outputTxBroadcasted', resp)
              } else if (resp.length && resp.every((el) => el.status == Status.CONFIRMED)) {
                promi.emit('outputTxConfirmed', resp)
                return true
              }
            } catch (err) {
              return false
            }
          }, 1000)
          resolve(resp)
        })() as unknown
    )
    return promi
  }

  abort() {
    this.controller.abort()
  }

  execute() {
    const promi = new PromiEvent<InnerTransactionStatus[]>(
      (resolve, reject) =>
        (async () => {
          try {
            this.controller.signal.addEventListener('abort', () => reject(new Error('Swap aborted by user')))
            let swapPromiEvent: PromiEvent<string>
            if (this.sourceAsset.assetInfo.isNative) {
              swapPromiEvent = this.sourceAsset['nativeToInterim'](
                this._amount,
                this._destinationAssets[0].destinationAddress,
                this._destinationAssets[0].asset.chainId,
                this._destinationAssets[0].userData
              )
            } else {
              swapPromiEvent = this.sourceAsset['hostToInterim'](
                this._amount,
                this._destinationAssets[0].destinationAddress,
                this._destinationAssets[0].asset.chainId,
                this._destinationAssets[0].userData
              )
            }
            const txHash = await swapPromiEvent
              .on('depositAddress', (depositAddress) => {
                promi.emit('depositAddress', depositAddress)
              })
              .on('txBroadcasted', (txHash) => {
                promi.emit('inputTxBroadcasted', txHash)
              })
              .on('txConfirmed', (txHash) => {
                promi.emit('inputTxConfirmed', txHash)
              })
            await this.monitorInputTransactions(txHash, this.sourceAsset.chainId).on('inputTxDetected', (inputs) => {
              promi.emit('inputTxDetected', inputs)
            })
            const outputs = await this.monitorOutputTransactions(txHash, this.sourceAsset.chainId)
              .on('outputTxBroadcasted', (outputs) => {
                promi.emit('outputTxDetected', outputs)
              })
              .on('outputTxConfirmed', (outputs) => {
                promi.emit('outputTxProcessed', outputs)
              })
            return resolve(outputs)
          } catch (err) {
            return reject(err)
          }
        })() as unknown
    )
    return promi
  }
}
