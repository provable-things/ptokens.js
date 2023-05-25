import { pTokensSwap, DestinationInfo } from './ptokens-swap'
import { pTokensAsset } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import { stringUtils, validators } from 'ptokens-helpers'
import BigNumber from 'bignumber.js'

export class pTokensSwapBuilder {
  private _sourceAsset: pTokensAsset
  private _destinationAssets: DestinationInfo[] = []
  private _amount: BigNumber
  private _node: pTokensNode

  /**
   * Create and initialize a pTokensSwapBuilder object.
   * @param _node - A pNetworkNode necessary for pNetworkSwap.
   */
  constructor(_node: pTokensNode) {
    this._node = _node
  }

  /**
   * Return the pTokensAsset set as source asset for the swap.
   */
  get sourceAsset(): pTokensAsset {
    return this._sourceAsset
  }

  /**
   * Set the source asset for the swap.
   * @param _asset - A pTokenAsset that will be the swap source asset.
   * @returns The same builder. This allows methods chaining.
   */
  setSourceAsset(_asset: pTokensAsset) {
    this._sourceAsset = _asset
    return this
  }

  /**
   * Return the pTokensAsset array set as destination assets for the swap.
   * Actually, only one destination asset is supported by pNetwork v2.
   */
  get destinationAssets(): pTokensAsset[] {
    return this._destinationAssets.map((_el) => _el.asset)
  }

  /**
   * Add a destination pTokensAsset for the swap.
   * @param _asset - A pTokenAsset that will be one of the destination assets.
   * @param _destinationAddress - The destination address that will receive the _asset.
   * @param _userData - Optional user data.
   * @returns The same builder. This allows methods chaining.
   */
  addDestinationAsset(_asset: pTokensAsset, _destinationAddress: string, _userData: Uint8Array = undefined) {
    const isValidAddressFunction = validators.chainIdToAddressValidatorMap.get(_asset.chainId)
    if (!isValidAddressFunction(_destinationAddress)) throw new Error('Invalid destination address')
    this._destinationAssets.push({ asset: _asset, destinationAddress: _destinationAddress, userData: _userData })
    return this
  }

  /**
   * Return the amount of source asset that will be swapped.
   */
  get amount(): string {
    return this._amount.toFixed()
  }

  /**
   * Set the amount of source asset that will be swapped.
   * @param _amount - The amount of source asset that will be swapped.
   * @returns The same builder. This allows methods chaining.
   */
  setAmount(_amount: number | string) {
    this._amount = BigNumber(_amount)
    return this
  }

  /**
   * Return the pTokensNode set when creating the builder.
   */
  get node(): pTokensNode {
    return this._node
  }

  private isValidSwap() {
    return this.destinationAssets.every(
      (_asset) =>
        stringUtils.addHexPrefix(_asset.assetInfo.tokenReference).toLowerCase() ===
        stringUtils.addHexPrefix(this.sourceAsset.assetInfo.tokenReference).toLowerCase()
    )
  }

  isAmountSufficient() {
    return BigNumber(this.expectedOutputAmount).isGreaterThanOrEqualTo(0)
  }

  private getSwapBasisPoints() {
    // take the first destination asset as, for now, pNetwork supports just one destination
    if (
      this._sourceAsset.assetInfo.isNative &&
      this._destinationAssets[0].asset.assetInfo.isNative &&
      'nativeToNative' in this._sourceAsset.assetInfo.fees.basisPoints
    )
      return this._sourceAsset.assetInfo.fees.basisPoints.nativeToNative
    else if (
      this._sourceAsset.assetInfo.isNative &&
      !this._destinationAssets[0].asset.assetInfo.isNative &&
      'nativeToHost' in this._sourceAsset.assetInfo.fees.basisPoints
    )
      return this._sourceAsset.assetInfo.fees.basisPoints.nativeToHost
    else if (
      !this._sourceAsset.assetInfo.isNative &&
      this._destinationAssets[0].asset.assetInfo.isNative &&
      'hostToNative' in this._sourceAsset.assetInfo.fees.basisPoints
    )
      return this._sourceAsset.assetInfo.fees.basisPoints.hostToNative
    else if (
      !this._sourceAsset.assetInfo.isNative &&
      !this._destinationAssets[0].asset.assetInfo.isNative &&
      'hostToHost' in this._sourceAsset.assetInfo.fees.basisPoints
    )
      return this._sourceAsset.assetInfo.fees.basisPoints.hostToHost
    else throw new Error('Invalid basis points')
  }

  get protocolFees() {
    const interimAmount = this._amount.multipliedBy(1e18)
    const basisPoints = this.getSwapBasisPoints()
    return BigNumber.maximum(
      this._sourceAsset.assetInfo.fees.minNodeOperatorFee,
      interimAmount.multipliedBy(basisPoints).dividedBy(10000)
    )
      .dividedBy(1e18)
      .toFixed()
  }

  get networkFees() {
    return BigNumber(this._destinationAssets[0].asset.assetInfo.fees.networkFee).dividedBy(1e18).toFixed()
  }

  get expectedOutputAmount() {
    return this._amount.minus(this.protocolFees).minus(this.networkFees).toFixed()
  }

  /**
   * Build a pTokensSwap object from the parameters set when interacting with the builder.
   * @returns - An immutable pTokensSwap object.
   */
  build(): pTokensSwap {
    if (!this._amount) throw new Error('Missing amount')
    if (!this._sourceAsset) throw new Error('Missing source asset')
    if (this._destinationAssets.length === 0) throw new Error('Missing destination assets')
    if (!this.isValidSwap()) throw new Error('Invalid swap')
    if (!this.isAmountSufficient()) throw new Error('Insufficient amount to cover fees')
    const ret = new pTokensSwap(this._node, this.sourceAsset, this._destinationAssets, this._amount)
    return ret
  }
}
