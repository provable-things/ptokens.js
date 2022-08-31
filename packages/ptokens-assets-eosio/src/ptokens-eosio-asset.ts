import { pTokensAsset, pTokenAssetConfig } from 'ptokens-entities'
import PromiEvent from 'promievent'
import { pTokensNode } from 'ptokens-node'
import { pTokensEosioProvider } from './ptokens-eosio-provider'

import pTokenOnEOSIOContractAbi from './abi/pTokenOnEOSContractAbiV2.json'

const EOSIO_TOKEN_PEG_OUT_METHOD = 'redeem2'

export type pTokenEosioAssetConfig = pTokenAssetConfig & {
  provider?: pTokensEosioProvider
  sourceAddress?: string
}

const getAmountInEosFormat = (_amount: number, _decimals = 4, symbol: string) => {
  return `${_amount.toFixed(_decimals)} ${symbol}`
}

export class pTokensEosioAsset extends pTokensAsset {
  private provider: pTokensEosioProvider
  private sourceAddress: string

  constructor(config: pTokenEosioAssetConfig) {
    super(config)
    this.provider = config.provider
    this.sourceAddress = config.sourceAddress
  }

  nativeToInterim(
    node: pTokensNode,
    amount: number,
    destinationAddress: string,
    destinationChainId: string,
    userData?: BinaryData
  ): PromiEvent<string> {
    throw new Error('Method not implemented.')
  }

  hostToInterim(
    node: pTokensNode,
    amount: number,
    destinationAddress: string,
    destinationChainId: string,
    userData?: BinaryData
  ): PromiEvent<string> {
    const promi = new PromiEvent<string>(
      (resolve, reject) =>
        (async () => {
          try {
            if (!this.provider) return reject(new Error('Missing provider'))
            if (!this.sourceAddress) return reject(new Error('Missing owner for source asset'))
            const assetInfo = await node.getAssetInfo(this.symbol, this.chainId)
            if (assetInfo.isNative) return reject(new Error('Invalid call to hostToInterim() for native token'))
            const data = {
              sender: this.sourceAddress,
              quantity: getAmountInEosFormat(amount, 8, this.symbol.toUpperCase()),
              memo: destinationAddress,
              user_data: userData || '',
              chain_id: destinationChainId.substring(2),
            }
            const txHash: string = await this.provider
              .makeContractSend(
                {
                  method: EOSIO_TOKEN_PEG_OUT_METHOD,
                  abi: pTokenOnEOSIOContractAbi,
                  contractAddress: assetInfo.tokenAddress,
                },
                data
              )
              .once('txBroadcasted', (_hash) => promi.emit('txBroadcasted', _hash))
              .once('txConfirmed', (_hash) => promi.emit('txConfirmed', _hash))
              .once('error', reject)
            return resolve(txHash)
          } catch (_err) {
            return reject(_err)
          }
        })() as unknown
    )
    return promi
  }
}
