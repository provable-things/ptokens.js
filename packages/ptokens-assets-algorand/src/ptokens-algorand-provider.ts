import { pTokensAssetProvider } from 'ptokens-entities'
import algosdk from 'algosdk'
import PromiEvent from 'promievent'

export interface SignerResult {
  /** A blob representing the signed transaction bytes */
  blob: string
}

export interface SignatureProvider {
  /**
   * A method that will be used to sign a group of transactions.
   * @param _transactions - An array of Algorand transactions to be signed.
   */
  signTxn(_transactions: algosdk.Transaction[]): Promise<string[] | SignerResult[]>
}

const decodeBlob = (_blob: string) =>
  new Uint8Array(
    Buffer.from(_blob, 'base64')
      .toString('binary')
      .split('')
      .map((x) => x.charCodeAt(0))
  )

export class BasicSignatureProvider implements SignatureProvider {
  private _secretKey: algosdk.Account

  /**
   * Create and initialize a basic signature provider from a secret key mnemonic.
   * @param _mnemonic - The secret key mnemonic.
   */
  constructor(_mnemonic: string) {
    this._secretKey = algosdk.mnemonicToSecretKey(_mnemonic)
  }

  signTxn(_transactions: algosdk.Transaction[]) {
    return Promise.resolve(
      _transactions
        .map((_txn) => algosdk.signTransaction(_txn, this._secretKey.sk))
        .map((_signedTxn) => Buffer.from(_signedTxn.blob).toString('base64'))
    )
  }
}

export class pTokensAlgorandProvider implements pTokensAssetProvider {
  private _client: algosdk.Algodv2
  private _signer: SignatureProvider
  private _account: string

  /**
   * Create and initialize a pTokensAlgorandProvider object.
   * @param _client - An algosdk.Algodv2 instance.
   * @param _signer - A signature provider instance implementing _signTxn()_.
   */
  constructor(_client: algosdk.Algodv2, _signer?: SignatureProvider) {
    if (!_client) throw new Error('Invalid AlgodClient argument')
    this._client = _client
    this._signer = _signer
  }

  /** Return the account set with _setAccount()_. */
  get account(): string {
    return this._account
  }

  /**
   * Set an account
   * @param _account - The account.
   * @returns The same provider. This allows methods chaining.
   */
  setAccount(_account: string) {
    this._account = _account
    return this
  }

  /**
   * Push on-chain an array of transactions in a transactions group.
   * The function returns a PromiEvent, i.e. a Promise that can also emit events.
   * In particular, the events fired during the execution are the following:
   * * _txBroadcasted_ -\> fired with the transactions group ID when the transactions are broadcasted on-chain;
   * * _txConfirmed_ -\> fired with the transactions group ID when the transactions are confirmed on-chain;
   * @param _txns - The transactions to be broadcasted.
   * @returns A PromiEvent that resolves with the hash of the latest transaction in the input array.
   */
  transactInGroup(_txns: algosdk.Transaction[]) {
    const promi = new PromiEvent<string>(
      (resolve, reject) =>
        (async () => {
          try {
            if (!this._signer || !this._signer.signTxn) throw new Error('Invalid signature provider')
            algosdk.assignGroupID(_txns)
            const groupId = _txns[0].group.toString('base64')
            const signedTxs = await this._signer.signTxn(_txns)
            await this._client
              .sendRawTransaction(
                signedTxs.map((_txn: SignerResult | string) => {
                  if (typeof _txn === 'string') return decodeBlob(_txn)
                  else return decodeBlob(_txn.blob)
                })
              )
              .do()
            promi.emit('txBroadcasted', groupId)
            await this.waitForTransactionConfirmation(_txns.at(-1).txID())
            promi.emit('txConfirmed', groupId)
            return resolve(_txns.at(-1).txID())
          } catch (_err) {
            return reject(_err)
          }
        })() as unknown
    )
    return promi
  }

  /**
   * Get suggested parameters for an Algorand transaction.
   * @returns A SuggestedParams object (https://algorand.github.io/js-algorand-sdk/interfaces/SuggestedParams.html).
   */
  async getTransactionParams() {
    return await this._client.getTransactionParams().do()
  }

  async waitForTransactionConfirmation(_txHash: string): Promise<string> {
    await algosdk.waitForConfirmation(this._client, _txHash, 10)
    return _txHash
  }
}
