import { pTokensAsset } from 'ptokens-entities'
import { pTokensNode, Status, InnerTransactionStatus } from 'ptokens-node'
import PromiEvent from 'promievent'
import polling from 'light-async-polling'

export type DestinationInfo = {
  asset: pTokensAsset
  destinationAddress: string
  userData?: BinaryData
}

export class pTokensSwap {
  private _node: pTokensNode
  private _sourceAsset: pTokensAsset
  private _destinationAssets: Array<DestinationInfo>
  private _amount: number
  private controller: AbortController

  constructor(node: pTokensNode, sourceAsset: pTokensAsset, destinationAssets: Array<DestinationInfo>, amount: number) {
    this._node = node
    this._sourceAsset = sourceAsset
    this._destinationAssets = destinationAssets
    this._amount = amount
    this.controller = new AbortController()
  }

  public get sourceAsset(): pTokensAsset {
    return this._sourceAsset
  }

  public get destinationAssets(): Array<pTokensAsset> {
    return this._destinationAssets.map((_el) => _el.asset)
  }

  public get amount(): number {
    return this._amount
  }

  public get node(): pTokensNode {
    return this._node
  }

  private monitorInputTransactions(txHash: string, origChainId: string): PromiEvent<InnerTransactionStatus[]> {
    const promi = new PromiEvent<InnerTransactionStatus[]>(
      (resolve) =>
        (async () => {
          async function getInputTransactions(node: pTokensNode) {
            const resp = await node.getTransactionStatus(txHash, origChainId)
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

  private monitorOutputTransactions(txHash: string, origChainId: string): PromiEvent<InnerTransactionStatus[]> {
    const promi = new PromiEvent<InnerTransactionStatus[]>(
      (resolve) =>
        (async () => {
          async function getOutputTransactions(node: pTokensNode) {
            const resp = await node.getTransactionStatus(txHash, origChainId)
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
            const assetInfo = await this.node.getAssetInfo(this.sourceAsset.symbol)
            const sourceInfo = assetInfo.filter((info) => info.chainId == this.sourceAsset.chainId)[0]
            const isSupported = (asset: pTokensAsset) => assetInfo.some((_info) => _info.chainId === asset.chainId)
            if (!isSupported(this.sourceAsset) || !this.destinationAssets.every(isSupported))
              return reject(new Error('Impossible to swap'))
            let swapPromiEvent: PromiEvent<string>
            if (sourceInfo.isNative) {
              swapPromiEvent = this.sourceAsset.nativeToInterim(
                this.node,
                this.amount,
                this._destinationAssets[0].destinationAddress,
                this._destinationAssets[0].asset.chainId,
                this._destinationAssets[0].userData
              )
            } else {
              swapPromiEvent = this.sourceAsset.hostToInterim(
                this.node,
                this.amount,
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
