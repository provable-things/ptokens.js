import { pTokensAsset } from './ptokens-asset'
import { ChainId, Blockchain, Network } from './constants'
import { pTokensNode, AssetInfo } from 'ptokens-node'

export abstract class pTokensAssetBuilder {
  protected _name: string
  protected _symbol: string
  protected _weight: number
  protected _network: Network
  protected _blockchain: Blockchain
  protected _chainId: ChainId
  protected _node: pTokensNode
  protected _assetInfo: AssetInfo

  constructor(_node: pTokensNode) {
    this._node = _node
  }

  setName(name: string) {
    this._name = name
    return this
  }

  setSymbol(symbol: string) {
    this._symbol = symbol
    return this
  }

  setWeight(weight: number) {
    this._weight = weight
    return this
  }

  setBlockchain(chainId: ChainId) {
    this._chainId = chainId
    return this
  }

  async populateAssetInfo() {
    if (!this._chainId) throw new Error('Missing chain ID')
    if (!this._symbol) throw new Error('Missing symbol')
    const assetInfo = await this._node.getAssetInfoByChainId(this._symbol, this._chainId)
    if (!assetInfo) throw new Error(`Unsupported token for chain ID ${this._chainId}`)
    this._assetInfo = assetInfo
  }

  abstract build(): Promise<pTokensAsset>
}
