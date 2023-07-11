import { pTokensSwap, DestinationInfo } from './ptokens-swap'
import { pTokensAsset } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import { stringUtils, validators } from 'ptokens-helpers'
import BigNumber from 'bignumber.js'
import { ChainId, TokenAddresses } from 'ptokens-constants'

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
    if (
      this.sourceAsset.assetInfo.tokenAddress === TokenAddresses.PTLOS_ON_ETH &&
      this.destinationAssets.some((_dest) => _dest.assetInfo.chainId !== ChainId.TelosMainnet)
    )
      return false
    else if (
      this.sourceAsset.assetInfo.tokenAddress === TokenAddresses.PIQ_ON_ETH &&
      this.destinationAssets.some((_dest) => _dest.assetInfo.chainId !== ChainId.EosMainnet)
    )
      return false
    else
      return this.destinationAssets.every(
        (_asset) =>
          stringUtils.addHexPrefix(_asset.assetInfo.tokenReference).toLowerCase() ===
          stringUtils.addHexPrefix(this.sourceAsset.assetInfo.tokenReference).toLowerCase()
      )
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
    const ret = new pTokensSwap(this._node, this.sourceAsset, this._destinationAssets, this._amount)
    return ret
  }
}
