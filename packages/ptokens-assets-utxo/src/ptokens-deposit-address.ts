import { Blockchain, Network } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'

export type DepositAddressConfig = {
  nativeBlockchain: Blockchain
  nativeNetwork: Network
  node: pTokensNode
}

export class pTokensDepositAddress {
  nativeBlockchain: Blockchain
  nativeNetwork: Network
  node: pTokensNode
  nonce: number
  enclavePublicKey: string
  address: string
  hostAddress: string

  constructor(_config: DepositAddressConfig) {
    this.nativeBlockchain = _config.nativeBlockchain
    this.nativeNetwork = _config.nativeNetwork
    this.node = _config.node
  }

  async generate(_hostAddress: string, _originatingChainId: string, _destinationChainId: string) {
    try {
      const res = await this.node.getNativeDepositAddress(_originatingChainId, _hostAddress, _destinationChainId)
      this.nonce = res.nonce
      this.enclavePublicKey = res.enclavePublicKey
      this.address = res.nativeDepositAddress
      this.hostAddress = _hostAddress
      return this.address
    } catch (_err) {
      throw new Error('Error during deposit address generation')
    }
  }

  toString() {
    return this.address
  }

  verify() {
    // TODO: implement verify
    throw new Error('verify() is not implemented')
  }
}
