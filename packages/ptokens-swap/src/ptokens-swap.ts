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

  /**
   * Create and initialize a pTokensSwap object. pTokensSwap object shall be created using a pTokensSwapBuilder object.
   * @param node - A pNetworkNode necessary for the swap process.
   * @param sourceAsset - The pTokensAsset that will be the source asset for the swap.
   * @param destinationAssets - The pTokensAsset array that will be destination assets for the swap.
   * @param amount - The amount of source asset that will be swapped.
   */
  constructor(node: pTokensNode, sourceAsset: pTokensAsset, destinationAssets: DestinationInfo[], amount: BigNumber) {
    this._node = node
    this._sourceAsset = sourceAsset
    this._destinationAssets = destinationAssets
    this._amount = amount
    this.controller = new AbortController()
  }

  /**
   * Return the pTokensAsset set as source asset for the swap.
   */
  get sourceAsset(): pTokensAsset {
    return this._sourceAsset
  }

  /**
   * Return the pTokensAsset array set as destination assets for the swap.
   */
  get destinationAssets(): pTokensAsset[] {
    return this._destinationAssets.map((_el) => _el.asset)
  }

  /**
   * Return the amount of source asset that will be swapped.
   */
  get amount(): string {
    return this._amount.toFixed()
  }

  /**
   * Return the pTokensNode set when creating the builder.
   */
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
                promi.emit('outputTxDetected', resp)
                return false
              } else if (resp.length && resp.every((el) => el.status == Status.BROADCASTED)) {
                promi.emit('outputTxBroadcasted', resp)
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

  /**
   * Abort a running swap.
   */
  abort() {
    this.controller.abort()
  }

  /**
   * Execute a swap. The function returns a PromiEvent, i.e. a Promise that can also emit events.
   * In particular, the events fired during the execution are the following:
   * * _depositAddress_ -\> fired with the deposit address where a user would transfer the source asset (applies for source pTokensUtxoAsset only);
   * * _inputTxBroadcasted_ -\> fired with hash of the transaction initiating the swap when it is broadcasted;
   * * _inputTxConfirmed_ -\> fired with hash of the transaction initiating the swap when it is confirmed;
   * * _inputTxDetected_ -\> fired with a InnerTransactionStatus object related to the input transaction, when the pNetwork detects the swap request;
   * * _outputTxDetected_ -\> fired with a InnerTransactionStatus object related to the output transaction, when the pNetwork builds the output transaction;
   * * _outputTxBroadcasted_ -\> fired with a InnerTransactionStatus object related to the output transaction, when the pNetwork broadcasts the output transaction;
   * * _outputTxConfirmed_ -\> fired with a InnerTransactionStatus object related to the output transaction, when it is confirmed, only when the destination asset has a provider;
   * @returns A PromiEvent that resolves with the transaction status of the resulting output transactions.
   * If the destination asset has a provider, the PromiEvent resolves when the output transaction is confirmed; otherwise when it is broadcasted.
   */
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
              .on('outputTxDetected', (outputs) => {
                promi.emit('outputTxDetected', outputs)
              })
              .on('outputTxBroadcasted', (outputs) => {
                promi.emit('outputTxBroadcasted', outputs)
              })
            if (this._destinationAssets[0].asset.provider) {
              await this._destinationAssets[0].asset.provider.waitForTransactionConfirmation(outputs[0].txHash)
              promi.emit('outputTxConfirmed', outputs)
            }
            return resolve(outputs)
          } catch (err) {
            return reject(err)
          }
        })() as unknown
    )
    return promi
  }
}
