import { pTokensNode } from 'ptokens-node'

export type DepositAddressConfig = {
  node: pTokensNode
}

export class pTokensDepositAddress {
  private _node: pTokensNode
  private _nonce: number
  private _enclavePublicKey: string
  private _address: string
  private _hostAddress: string

  constructor(_config: DepositAddressConfig) {
    this._node = _config.node
  }

  async generate(_hostAddress: string, _originatingChainId: string, _destinationChainId: string) {
    try {
      const res = await this._node.getNativeDepositAddress(_originatingChainId, _hostAddress, _destinationChainId)
      this._nonce = res.nonce
      this._enclavePublicKey = res.enclavePublicKey
      this._address = res.nativeDepositAddress
      this._hostAddress = _hostAddress
      return this._address
    } catch (_err) {
      throw new Error('Error during deposit address generation')
    }
  }

  get address() {
    return this._address
  }

  verify() {
    // TODO: implement verify
    throw new Error('verify() is not implemented')
  }
}
