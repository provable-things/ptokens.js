import { pTokensAsset } from './ptokens-asset'
import { ChainId, Blockchain, Network, BlockchainType, chainIdToTypeMap } from 'ptokens-constants'
import { pTokensNode, AssetInfo } from 'ptokens-node'

export abstract class pTokensAssetBuilder {
  protected _symbol: string
  protected _decimals: number
  protected _weight: number
  protected _network: Network
  protected _blockchain: Blockchain
  protected _chainId: ChainId
  protected _node: pTokensNode
  protected _assetInfo: AssetInfo
  private _type: BlockchainType

  constructor(_node: pTokensNode, _type: BlockchainType) {
    this._node = _node
    this._type = _type
  }

  setSymbol(_symbol: string) {
    this._symbol = _symbol
    return this
  }

  setWeight(_weight: number) {
    this._weight = _weight
    return this
  }

  setBlockchain(_chainId: ChainId) {
    if (chainIdToTypeMap.get(_chainId) !== this._type) throw new Error('Unsupported chain ID')
    this._chainId = _chainId
    return this
  }

  setDecimals(_decimals: number) {
    this._decimals = _decimals
    return this
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async _build(): Promise<pTokensAsset> {
    throw new Error('_build() is not implemented')
  }

  private async validate() {
    if (!this._chainId) throw new Error('Missing chain ID')
    if (!this._symbol) throw new Error('Missing symbol')
    const assetInfo = await this._node.getAssetInfoByChainId(this._symbol, this._chainId)
    if (!assetInfo) throw new Error(`Unsupported token for chain ID ${this._chainId}`)
    if (this._decimals !== undefined) assetInfo.decimals = this._decimals
    this._assetInfo = assetInfo
  }

  async build(): Promise<pTokensAsset> {
    await this.validate()
    return this._build()
  }
}
