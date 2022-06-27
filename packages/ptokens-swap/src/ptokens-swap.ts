import { pTokensAsset } from 'ptokens-entities'
import { pTokensNode, Status, InnerTransactionStatus } from 'ptokens-node'
import PromiEvent from 'promievent'
import polling from 'light-async-polling'

export class pTokensSwap {
  private node: pTokensNode
  private sourceAsset: pTokensAsset
  private destinationAssets: Array<pTokensAsset>
  private amount: number
  private metadata: BinaryData

  constructor(
    node: pTokensNode,
    sourceAsset: pTokensAsset,
    destinationAssets: Array<pTokensAsset>,
    amount: number,
    metadata: BinaryData
  ) {
    this.node = node
    this.sourceAsset = sourceAsset
    this.destinationAssets = destinationAssets
    this.amount = amount
    this.metadata = metadata
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
            resp = await getOutputTransactions(this.node)
            if (resp.length && resp.every((el) => el.status == Status.CONFIRMED)) {
              promi.emit('outputTxConfirmed', resp)
              return true
            } else if (resp.length && !notified) {
              notified = true
              promi.emit('outputTxBroadcasted', resp)
            }
            return false
          }, 1000)
          resolve(resp)
        })() as unknown
    )
    return promi
  }

  execute() {
    const promi = new PromiEvent<InnerTransactionStatus[]>(
      (resolve) =>
        (async () => {
          const sourceInfo = await this.node.getAssetInfo(this.sourceAsset.symbol, this.sourceAsset.chainId)
          let ab: PromiEvent<string>
          if (sourceInfo.isNative) {
            ab = this.sourceAsset.nativeToInterim(
              this.node,
              this.destinationAssets[0].destinationAddress,
              this.destinationAssets[0].chainId
            )
          } else {
            ab = this.sourceAsset.hostToInterim(
              this.node,
              this.destinationAssets[0].destinationAddress,
              this.destinationAssets[0].chainId
            )
          }
          const txHash = await ab
            .on('txBroadcasted', (txHash) => {
              promi.emit('inputTxDetected', txHash)
            })
            .on('txConfirmed', (txHash) => {
              promi.emit('inputTxProcessed', txHash)
            })
          const outputs = await this.monitorOutputTransactions(txHash, this.sourceAsset.chainId)
            .on('outputTxBroadcasted', (outputs) => {
              promi.emit('outputTxDetected', outputs)
            })
            .on('outputTxConfirmed', (outputs) => {
              promi.emit('outputTxProcessed', outputs)
            })

          resolve(outputs)
        })() as unknown
    )
    return promi
  }
}
