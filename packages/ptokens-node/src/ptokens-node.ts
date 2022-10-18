import { pTokensNodeProvider } from './ptokens-node-provider'

export enum Status {
  /** Transaction errored  */
  ERROR = -1,
  /** Transaction has been broadcasted */
  BROADCASTED = 0,
  /** Transaction has been confirmed */
  CONFIRMED = 1,
}

export type InnerTransactionStatus = {
  /** The transaction hash. */
  txHash: string
  /** The status of the transaction. */
  status: Status
  /** The chain ID of the blockchain where the transaction took place. */
  chainId: string
}

export type TransactionStatus = {
  /** Input transactions. Actually, only one input is supported. */
  inputs: InnerTransactionStatus[]
  /** Output transactions. Actually, only one output is supported. */
  outputs: InnerTransactionStatus[]
}

export type AssetInfo = {
  /** The chain ID of the asset's blockchain. */
  chainId: string
  /** Boolean indicating if the asset is native in the blockchain. */
  isNative: boolean
  /** Token smart contract address. */
  tokenAddress: string
  /** Internal reference which uniquely identifies the asset within the pNetwork. */
  tokenReference: string
  /** Token's decimals. */
  decimals?: number
  /** Vault address where tokens shall be transferred for pegging in. */
  vaultAddress?: string
  /** pNetwork enclave address. */
  identity?: string
}

export type NativeDepositAddress = {
  nonce: number
  nativeDepositAddress: string
  enclavePublicKey: string
}

export class pTokensNode {
  private _provider: pTokensNodeProvider

  /**
   * Create and initialize a pTokensNode object.
   * @param _provider A pTokensNodeProvider that will be employed to send requests.
   */
  constructor(_provider: pTokensNodeProvider) {
    this._provider = _provider
  }

  /** Return the pTokensNodeProvider set when calling constructor. */
  get provider(): pTokensNodeProvider {
    return this._provider
  }

  /**
   * Get the transaction status related to a transaction.
   * @param _txHash The hash of the transaction.
   * @param _originatingChainId The chain ID where the transaction took place.
   * @returns A Promise that resolves with a TransactionStatus object related to the queried transaction.
   */
  async getTransactionStatus(_txHash: string, _originatingChainId: string): Promise<TransactionStatus> {
    return await this.provider.sendRpcRequest(1, 'node_getTransactionStatus', [_txHash, _originatingChainId])
  }

  /**
   * Get asset info related to those blockchains where pNetwork supports the input symbol.
   * @param _tokenSymbol The token symbol.
   * @returns An array of AssetInfo objects for those chains where pNetwork supports the specified token.
   */
  async getSupportedChainsByAsset(_tokenSymbol: string): Promise<AssetInfo[]> {
    return await this.provider.sendRpcRequest(1, 'node_getSupportedChainsByAsset', [_tokenSymbol])
  }

  /**
   * Get asset info related to a particular blockchain where pNetwork should support the input symbol.
   * @param _tokenSymbol The token symbol.
   * @param _chainId The chain ID of the blockchain.
   * @returns An AssetInfo object for the specified blockchain. Null if the specified blockchain does not support the token.
   */
  async getAssetInfoByChainId(_tokenSymbol: string, _chainId: string): Promise<AssetInfo> {
    const info = (await this.getSupportedChainsByAsset(_tokenSymbol)).filter((p) => p.chainId == _chainId)
    return info.length ? info.at(0) : null
  }

  /**
   * Get a native deposit address where to transfer a UTXO asset for initiating a peg-in.
   * @param _originatingChainId The chain ID of the source asset.
   * @param _address The destination asset in the destination chain ID.
   * @param _destinationChainId The chain ID of the destination asset.
   * @returns A Promise that resolves with a NativeDepositAddress.
   */
  async getNativeDepositAddress(
    _originatingChainId: string,
    _address: string,
    _destinationChainId: string
  ): Promise<NativeDepositAddress> {
    return await this.provider.sendRpcRequest(1, 'node_getNativeDepositAddress', [
      _originatingChainId,
      _address,
      _destinationChainId,
    ])
  }
}
