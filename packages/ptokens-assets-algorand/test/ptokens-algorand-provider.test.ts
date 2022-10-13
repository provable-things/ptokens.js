import { pTokensAlgorandProvider } from '../src'
import algosdk from 'algosdk'
import { BasicSignatureProvider } from '../src/ptokens-algorand-provider'
import JSONRequest from '../node_modules/algosdk/dist/cjs/src/client/v2/jsonrequest'
import SendRawTransaction from '../node_modules/algosdk/dist/cjs/src/client/v2/algod/sendRawTransaction'

const TEST_MNEMONIC =
  'remind hat sibling sock multiply heart tuition magic bounce option yard rely daring raven basket wood bike educate ensure museum gorilla oyster tower ability claim'

describe('Algorand provider', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should throw if algod client is undefined', () => {
    try {
      new pTokensAlgorandProvider(undefined, undefined)
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid AlgodClient argument')
    }
  })

  test('Should throw if algod client is null', () => {
    try {
      new pTokensAlgorandProvider(null, null)
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid AlgodClient argument')
    }
  })

  test('Should not create a provider without a signature provider', () => {
    try {
      const client = new algosdk.Algodv2('http://algoclient.p.network')
      new pTokensAlgorandProvider(client, null)
    } catch (err) {
      expect(err.message).toEqual('Invalid signature provider')
    }
  })

  test('Should not create a provider with an invalid signature provider', () => {
    try {
      const client = new algosdk.Algodv2('http://algoclient.p.network')
      new pTokensAlgorandProvider(client, { signTxn: undefined })
    } catch (err) {
      expect(err.message).toEqual('Invalid signature provider')
    }
  })

  test('Should correctly create a provider with a signature provider', () => {
    const signatureProvider = new BasicSignatureProvider(TEST_MNEMONIC)
    const client = new algosdk.Algodv2('http://algoclient.p.network')
    const provider = new pTokensAlgorandProvider(client, signatureProvider)
    provider.setAccount('account')
    expect(provider.account).toStrictEqual('account')
  })

  test('Should return transaction paramenter', async () => {
    const signatureProvider = new BasicSignatureProvider(TEST_MNEMONIC)
    const client = new algosdk.Algodv2('http://algoclient.p.network')
    const doSpy = jest.spyOn(JSONRequest.prototype, 'do').mockResolvedValue({ mockValue: 'value' })
    const getTransactionParamsSpy = jest.spyOn(client, 'getTransactionParams')
    const provider = new pTokensAlgorandProvider(client, signatureProvider)
    const parameters = await provider.getTransactionParams()
    expect(getTransactionParamsSpy).toHaveBeenNthCalledWith(1)
    expect(doSpy).toHaveBeenNthCalledWith(1)
    expect(parameters).toStrictEqual({ mockValue: 'value' })
  })

  test('Should correctly transact in group with BasicSignatureProvider', async () => {
    const signatureProvider = new BasicSignatureProvider(TEST_MNEMONIC)
    const client = new algosdk.Algodv2('http://algoclient.p.network')
    const provider = new pTokensAlgorandProvider(client, signatureProvider)
    const account = algosdk.mnemonicToSecretKey(TEST_MNEMONIC)
    const doSpy = jest.spyOn(SendRawTransaction.prototype, 'do').mockResolvedValue(true)
    const signTxnSpy = jest.spyOn(signatureProvider, 'signTxn')
    const sendRawTransactionSpy = jest.spyOn(client, 'sendRawTransaction')
    const waitForConfirmationSpy = jest.spyOn(algosdk, 'waitForConfirmation').mockResolvedValue({})
    const suggestedParams = {
      fee: 100,
      lastRound: 10000,
      firstRound: 9000,
      genesisID: 'mainnet-v1.0',
      genesisHash: 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
    }
    const tx1 = algosdk.makeApplicationCallTxnFromObject({
      from: account.addr,
      appIndex: 123456,
      suggestedParams,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
    })
    const tx2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: account.addr,
      to: account.addr,
      amount: 0,
      assetIndex: 123456,
      suggestedParams,
    })
    let txBroadcasted, txConfirmed
    let txBroadcastedObj, txConfirmedObj
    const res = await provider
      .transactInGroup([tx1, tx2])
      .on('txBroadcasted', (obj) => {
        txBroadcasted = true
        txBroadcastedObj = obj
      })
      .on('txConfirmed', (obj) => {
        txConfirmed = true
        txConfirmedObj = obj
      })
    expect(res).toStrictEqual(tx2.txID())
    expect(txBroadcasted).toBeTruthy()
    expect(txBroadcastedObj).toStrictEqual('htzK82MaCcs6tqDp/AGLQsMSewdZ2gIoExKo490wnoo=')
    expect(txConfirmed).toBeTruthy()
    expect(txConfirmedObj).toStrictEqual('htzK82MaCcs6tqDp/AGLQsMSewdZ2gIoExKo490wnoo=')
    expect(doSpy).toHaveBeenNthCalledWith(1)
    expect(signTxnSpy).toHaveBeenNthCalledWith(1, [tx1, tx2])
    expect(sendRawTransactionSpy).toHaveBeenNthCalledWith(1, [
      Uint8Array.from([
        130, 163, 115, 105, 103, 196, 64, 52, 2, 10, 77, 167, 111, 97, 26, 201, 237, 142, 75, 220, 28, 236, 207, 210,
        28, 191, 226, 13, 35, 77, 4, 236, 157, 225, 107, 255, 116, 30, 73, 210, 202, 45, 203, 68, 102, 206, 229, 64,
        251, 221, 35, 139, 164, 70, 79, 143, 168, 179, 97, 82, 194, 213, 11, 4, 184, 90, 164, 3, 0, 88, 2, 163, 116,
        120, 110, 137, 164, 97, 112, 105, 100, 206, 0, 1, 226, 64, 163, 102, 101, 101, 205, 80, 20, 162, 102, 118, 205,
        35, 40, 163, 103, 101, 110, 172, 109, 97, 105, 110, 110, 101, 116, 45, 118, 49, 46, 48, 162, 103, 104, 196, 32,
        192, 97, 196, 216, 252, 29, 189, 222, 210, 215, 96, 75, 228, 86, 142, 63, 109, 4, 25, 135, 172, 55, 189, 228,
        182, 32, 181, 171, 57, 36, 138, 223, 163, 103, 114, 112, 196, 32, 134, 220, 202, 243, 99, 26, 9, 203, 58, 182,
        160, 233, 252, 1, 139, 66, 195, 18, 123, 7, 89, 218, 2, 40, 19, 18, 168, 227, 221, 48, 158, 138, 162, 108, 118,
        205, 39, 16, 163, 115, 110, 100, 196, 32, 175, 2, 62, 150, 2, 68, 124, 165, 236, 189, 75, 223, 251, 31, 118,
        156, 33, 39, 101, 88, 127, 32, 27, 40, 38, 90, 245, 30, 181, 215, 124, 138, 164, 116, 121, 112, 101, 164, 97,
        112, 112, 108,
      ]),
      Uint8Array.from([
        130, 163, 115, 105, 103, 196, 64, 173, 154, 17, 109, 176, 65, 41, 82, 113, 52, 11, 55, 191, 93, 28, 7, 198, 117,
        119, 181, 198, 20, 148, 223, 220, 157, 154, 200, 65, 101, 167, 225, 218, 87, 212, 235, 160, 59, 36, 106, 0, 149,
        173, 226, 191, 58, 140, 99, 215, 115, 125, 0, 63, 14, 72, 244, 126, 146, 6, 224, 115, 107, 15, 4, 163, 116, 120,
        110, 138, 164, 97, 114, 99, 118, 196, 32, 175, 2, 62, 150, 2, 68, 124, 165, 236, 189, 75, 223, 251, 31, 118,
        156, 33, 39, 101, 88, 127, 32, 27, 40, 38, 90, 245, 30, 181, 215, 124, 138, 163, 102, 101, 101, 205, 95, 180,
        162, 102, 118, 205, 35, 40, 163, 103, 101, 110, 172, 109, 97, 105, 110, 110, 101, 116, 45, 118, 49, 46, 48, 162,
        103, 104, 196, 32, 192, 97, 196, 216, 252, 29, 189, 222, 210, 215, 96, 75, 228, 86, 142, 63, 109, 4, 25, 135,
        172, 55, 189, 228, 182, 32, 181, 171, 57, 36, 138, 223, 163, 103, 114, 112, 196, 32, 134, 220, 202, 243, 99, 26,
        9, 203, 58, 182, 160, 233, 252, 1, 139, 66, 195, 18, 123, 7, 89, 218, 2, 40, 19, 18, 168, 227, 221, 48, 158,
        138, 162, 108, 118, 205, 39, 16, 163, 115, 110, 100, 196, 32, 175, 2, 62, 150, 2, 68, 124, 165, 236, 189, 75,
        223, 251, 31, 118, 156, 33, 39, 101, 88, 127, 32, 27, 40, 38, 90, 245, 30, 181, 215, 124, 138, 164, 116, 121,
        112, 101, 165, 97, 120, 102, 101, 114, 164, 120, 97, 105, 100, 206, 0, 1, 226, 64,
      ]),
    ])
    expect(waitForConfirmationSpy).toHaveBeenNthCalledWith(1, client, tx2.txID(), 10)
  })

  test('Should correctly transact in group with another signature provider', async () => {
    const account = algosdk.mnemonicToSecretKey(TEST_MNEMONIC)
    const signatureProvider = {
      signTxn: (_transactions: algosdk.Transaction[]) =>
        Promise.resolve(
          _transactions
            .map((_txn) => algosdk.signTransaction(_txn, account.sk))
            .map((_signedTxn) => ({
              blob: Buffer.from(_signedTxn.blob).toString('base64'),
            }))
        ),
    }
    const client = new algosdk.Algodv2('http://algoclient.p.network')
    const provider = new pTokensAlgorandProvider(client, signatureProvider)
    const doSpy = jest.spyOn(SendRawTransaction.prototype, 'do').mockResolvedValue(true)
    const signTxnSpy = jest.spyOn(signatureProvider, 'signTxn')
    const sendRawTransactionSpy = jest.spyOn(client, 'sendRawTransaction')
    const waitForConfirmationSpy = jest.spyOn(algosdk, 'waitForConfirmation').mockResolvedValue({})
    const suggestedParams = {
      fee: 100,
      lastRound: 10000,
      firstRound: 9000,
      genesisID: 'mainnet-v1.0',
      genesisHash: 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
    }
    const tx1 = algosdk.makeApplicationCallTxnFromObject({
      from: account.addr,
      appIndex: 123456,
      suggestedParams,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
    })
    const tx2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: account.addr,
      to: account.addr,
      amount: 0,
      assetIndex: 123456,
      suggestedParams,
    })
    let txBroadcasted, txConfirmed
    let txBroadcastedObj, txConfirmedObj
    const res = await provider
      .transactInGroup([tx1, tx2])
      .on('txBroadcasted', (obj) => {
        txBroadcasted = true
        txBroadcastedObj = obj
      })
      .on('txConfirmed', (obj) => {
        txConfirmed = true
        txConfirmedObj = obj
      })
    expect(res).toStrictEqual(tx2.txID())
    expect(txBroadcasted).toBeTruthy()
    expect(txBroadcastedObj).toStrictEqual('htzK82MaCcs6tqDp/AGLQsMSewdZ2gIoExKo490wnoo=')
    expect(txConfirmed).toBeTruthy()
    expect(txConfirmedObj).toStrictEqual('htzK82MaCcs6tqDp/AGLQsMSewdZ2gIoExKo490wnoo=')
    expect(doSpy).toHaveBeenNthCalledWith(1)
    expect(signTxnSpy).toHaveBeenNthCalledWith(1, [tx1, tx2])
    expect(sendRawTransactionSpy).toHaveBeenNthCalledWith(1, [
      Uint8Array.from([
        130, 163, 115, 105, 103, 196, 64, 52, 2, 10, 77, 167, 111, 97, 26, 201, 237, 142, 75, 220, 28, 236, 207, 210,
        28, 191, 226, 13, 35, 77, 4, 236, 157, 225, 107, 255, 116, 30, 73, 210, 202, 45, 203, 68, 102, 206, 229, 64,
        251, 221, 35, 139, 164, 70, 79, 143, 168, 179, 97, 82, 194, 213, 11, 4, 184, 90, 164, 3, 0, 88, 2, 163, 116,
        120, 110, 137, 164, 97, 112, 105, 100, 206, 0, 1, 226, 64, 163, 102, 101, 101, 205, 80, 20, 162, 102, 118, 205,
        35, 40, 163, 103, 101, 110, 172, 109, 97, 105, 110, 110, 101, 116, 45, 118, 49, 46, 48, 162, 103, 104, 196, 32,
        192, 97, 196, 216, 252, 29, 189, 222, 210, 215, 96, 75, 228, 86, 142, 63, 109, 4, 25, 135, 172, 55, 189, 228,
        182, 32, 181, 171, 57, 36, 138, 223, 163, 103, 114, 112, 196, 32, 134, 220, 202, 243, 99, 26, 9, 203, 58, 182,
        160, 233, 252, 1, 139, 66, 195, 18, 123, 7, 89, 218, 2, 40, 19, 18, 168, 227, 221, 48, 158, 138, 162, 108, 118,
        205, 39, 16, 163, 115, 110, 100, 196, 32, 175, 2, 62, 150, 2, 68, 124, 165, 236, 189, 75, 223, 251, 31, 118,
        156, 33, 39, 101, 88, 127, 32, 27, 40, 38, 90, 245, 30, 181, 215, 124, 138, 164, 116, 121, 112, 101, 164, 97,
        112, 112, 108,
      ]),
      Uint8Array.from([
        130, 163, 115, 105, 103, 196, 64, 173, 154, 17, 109, 176, 65, 41, 82, 113, 52, 11, 55, 191, 93, 28, 7, 198, 117,
        119, 181, 198, 20, 148, 223, 220, 157, 154, 200, 65, 101, 167, 225, 218, 87, 212, 235, 160, 59, 36, 106, 0, 149,
        173, 226, 191, 58, 140, 99, 215, 115, 125, 0, 63, 14, 72, 244, 126, 146, 6, 224, 115, 107, 15, 4, 163, 116, 120,
        110, 138, 164, 97, 114, 99, 118, 196, 32, 175, 2, 62, 150, 2, 68, 124, 165, 236, 189, 75, 223, 251, 31, 118,
        156, 33, 39, 101, 88, 127, 32, 27, 40, 38, 90, 245, 30, 181, 215, 124, 138, 163, 102, 101, 101, 205, 95, 180,
        162, 102, 118, 205, 35, 40, 163, 103, 101, 110, 172, 109, 97, 105, 110, 110, 101, 116, 45, 118, 49, 46, 48, 162,
        103, 104, 196, 32, 192, 97, 196, 216, 252, 29, 189, 222, 210, 215, 96, 75, 228, 86, 142, 63, 109, 4, 25, 135,
        172, 55, 189, 228, 182, 32, 181, 171, 57, 36, 138, 223, 163, 103, 114, 112, 196, 32, 134, 220, 202, 243, 99, 26,
        9, 203, 58, 182, 160, 233, 252, 1, 139, 66, 195, 18, 123, 7, 89, 218, 2, 40, 19, 18, 168, 227, 221, 48, 158,
        138, 162, 108, 118, 205, 39, 16, 163, 115, 110, 100, 196, 32, 175, 2, 62, 150, 2, 68, 124, 165, 236, 189, 75,
        223, 251, 31, 118, 156, 33, 39, 101, 88, 127, 32, 27, 40, 38, 90, 245, 30, 181, 215, 124, 138, 164, 116, 121,
        112, 101, 165, 97, 120, 102, 101, 114, 164, 120, 97, 105, 100, 206, 0, 1, 226, 64,
      ]),
    ])
    expect(waitForConfirmationSpy).toHaveBeenNthCalledWith(1, client, tx2.txID(), 10)
  })

  test('Should reject when something rejects', async () => {
    const account = algosdk.mnemonicToSecretKey(TEST_MNEMONIC)
    const signatureProvider = new BasicSignatureProvider(TEST_MNEMONIC)
    const client = new algosdk.Algodv2('http://algoclient.p.network')
    const provider = new pTokensAlgorandProvider(client, signatureProvider)
    const doSpy = jest.spyOn(SendRawTransaction.prototype, 'do').mockRejectedValue(new Error('do error'))
    const signTxnSpy = jest.spyOn(signatureProvider, 'signTxn')
    const sendRawTransactionSpy = jest.spyOn(client, 'sendRawTransaction')
    const waitForConfirmationSpy = jest.spyOn(algosdk, 'waitForConfirmation').mockResolvedValue({})
    const suggestedParams = {
      fee: 100,
      lastRound: 10000,
      firstRound: 9000,
      genesisID: 'mainnet-v1.0',
      genesisHash: 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
    }
    const tx1 = algosdk.makeApplicationCallTxnFromObject({
      from: account.addr,
      appIndex: 123456,
      suggestedParams,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
    })
    const tx2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: account.addr,
      to: account.addr,
      amount: 0,
      assetIndex: 123456,
      suggestedParams,
    })
    let txBroadcasted, txConfirmed
    let txBroadcastedObj, txConfirmedObj
    try {
      await provider
        .transactInGroup([tx1, tx2])
        .on('txBroadcasted', (obj) => {
          txBroadcasted = true
          txBroadcastedObj = obj
        })
        .on('txConfirmed', (obj) => {
          txConfirmed = true
          txConfirmedObj = obj
        })
    } catch (err) {
      expect(err.message).toEqual('do error')
      expect(txBroadcasted).toBeUndefined()
      expect(txBroadcastedObj).toBeUndefined()
      expect(txConfirmed).toBeUndefined()
      expect(txConfirmedObj).toBeUndefined()
      expect(doSpy).toHaveBeenNthCalledWith(1)
      expect(signTxnSpy).toHaveBeenNthCalledWith(1, [tx1, tx2])
      expect(sendRawTransactionSpy).toHaveBeenNthCalledWith(1, [
        Uint8Array.from([
          130, 163, 115, 105, 103, 196, 64, 52, 2, 10, 77, 167, 111, 97, 26, 201, 237, 142, 75, 220, 28, 236, 207, 210,
          28, 191, 226, 13, 35, 77, 4, 236, 157, 225, 107, 255, 116, 30, 73, 210, 202, 45, 203, 68, 102, 206, 229, 64,
          251, 221, 35, 139, 164, 70, 79, 143, 168, 179, 97, 82, 194, 213, 11, 4, 184, 90, 164, 3, 0, 88, 2, 163, 116,
          120, 110, 137, 164, 97, 112, 105, 100, 206, 0, 1, 226, 64, 163, 102, 101, 101, 205, 80, 20, 162, 102, 118,
          205, 35, 40, 163, 103, 101, 110, 172, 109, 97, 105, 110, 110, 101, 116, 45, 118, 49, 46, 48, 162, 103, 104,
          196, 32, 192, 97, 196, 216, 252, 29, 189, 222, 210, 215, 96, 75, 228, 86, 142, 63, 109, 4, 25, 135, 172, 55,
          189, 228, 182, 32, 181, 171, 57, 36, 138, 223, 163, 103, 114, 112, 196, 32, 134, 220, 202, 243, 99, 26, 9,
          203, 58, 182, 160, 233, 252, 1, 139, 66, 195, 18, 123, 7, 89, 218, 2, 40, 19, 18, 168, 227, 221, 48, 158, 138,
          162, 108, 118, 205, 39, 16, 163, 115, 110, 100, 196, 32, 175, 2, 62, 150, 2, 68, 124, 165, 236, 189, 75, 223,
          251, 31, 118, 156, 33, 39, 101, 88, 127, 32, 27, 40, 38, 90, 245, 30, 181, 215, 124, 138, 164, 116, 121, 112,
          101, 164, 97, 112, 112, 108,
        ]),
        Uint8Array.from([
          130, 163, 115, 105, 103, 196, 64, 173, 154, 17, 109, 176, 65, 41, 82, 113, 52, 11, 55, 191, 93, 28, 7, 198,
          117, 119, 181, 198, 20, 148, 223, 220, 157, 154, 200, 65, 101, 167, 225, 218, 87, 212, 235, 160, 59, 36, 106,
          0, 149, 173, 226, 191, 58, 140, 99, 215, 115, 125, 0, 63, 14, 72, 244, 126, 146, 6, 224, 115, 107, 15, 4, 163,
          116, 120, 110, 138, 164, 97, 114, 99, 118, 196, 32, 175, 2, 62, 150, 2, 68, 124, 165, 236, 189, 75, 223, 251,
          31, 118, 156, 33, 39, 101, 88, 127, 32, 27, 40, 38, 90, 245, 30, 181, 215, 124, 138, 163, 102, 101, 101, 205,
          95, 180, 162, 102, 118, 205, 35, 40, 163, 103, 101, 110, 172, 109, 97, 105, 110, 110, 101, 116, 45, 118, 49,
          46, 48, 162, 103, 104, 196, 32, 192, 97, 196, 216, 252, 29, 189, 222, 210, 215, 96, 75, 228, 86, 142, 63, 109,
          4, 25, 135, 172, 55, 189, 228, 182, 32, 181, 171, 57, 36, 138, 223, 163, 103, 114, 112, 196, 32, 134, 220,
          202, 243, 99, 26, 9, 203, 58, 182, 160, 233, 252, 1, 139, 66, 195, 18, 123, 7, 89, 218, 2, 40, 19, 18, 168,
          227, 221, 48, 158, 138, 162, 108, 118, 205, 39, 16, 163, 115, 110, 100, 196, 32, 175, 2, 62, 150, 2, 68, 124,
          165, 236, 189, 75, 223, 251, 31, 118, 156, 33, 39, 101, 88, 127, 32, 27, 40, 38, 90, 245, 30, 181, 215, 124,
          138, 164, 116, 121, 112, 101, 165, 97, 120, 102, 101, 114, 164, 120, 97, 105, 100, 206, 0, 1, 226, 64,
        ]),
      ])
      expect(waitForConfirmationSpy).toHaveBeenCalledTimes(0)
    }
  })
})
