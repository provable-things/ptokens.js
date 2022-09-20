import algosdk from 'algosdk'
import { Transaction } from 'algosdk'
import PromiEvent from 'promievent'

export interface SignerResult {
  blob: string
}
export interface SignatureProvider {
  signTxn(_transactions: Transaction[]): string[] | SignerResult[]
}

const decodeBlob = (_blob: string) =>
  new Uint8Array(
    Buffer.from(_blob, 'base64')
      .toString('binary')
      .split('')
      .map((x) => x.charCodeAt(0))
  )

export class BasicSignatureProvider implements SignatureProvider {
  _secretKey: algosdk.Account
  constructor(_mnemonic: string) {
    this._secretKey = algosdk.mnemonicToSecretKey(_mnemonic)
  }
  signTxn(_transactions: algosdk.Transaction[]) {
    return _transactions
      .map((_txn) => algosdk.signTransaction(_txn, this._secretKey.sk))
      .map((_signedTxn) => Buffer.from(_signedTxn.blob).toString('base64'))
  }
}

export class pTokensAlgorandProvider {
  private _client: algosdk.Algodv2
  private _signer: SignatureProvider
  private _account: string

  constructor(_client: algosdk.Algodv2, _signer: SignatureProvider) {
    if (!_client) throw new Error('Invalid AlgodClient argument')
    if (!_signer || !_signer.signTxn) throw new Error('Invalid signature provider')
    this._client = _client
    this._signer = _signer
  }

  public transactInGroup(txns: Transaction[]) {
    const promi = new PromiEvent<string>(
      (resolve, reject) =>
        (async () => {
          try {
            algosdk.assignGroupID(txns)
            const groupId = txns[0].group.toString('base64')
            const signedTxs = this._signer.signTxn(txns)
            await this._client
              .sendRawTransaction(
                signedTxs.map((_txn: SignerResult | string) => {
                  if (typeof _txn === 'string') return decodeBlob(_txn)
                  else return decodeBlob(_txn.blob)
                })
              )
              .do()
            promi.emit('txBroadcasted', groupId)
            await algosdk.waitForConfirmation(this._client, txns[0].txID(), 10)
            promi.emit('txConfirmed', groupId)
            return resolve(groupId)
          } catch (_err) {
            return reject(_err)
          }
        })() as unknown
    )
    return promi
  }

  public get account(): string {
    return this._account
  }

  public setAccount(_account: string) {
    this._account = _account
    return this
  }

  async getTransactionParams() {
    return await this._client.getTransactionParams().do()
  }
}
