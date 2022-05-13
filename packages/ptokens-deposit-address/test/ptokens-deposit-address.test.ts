import { DepositAddress } from '../src/index'
import Web3 from 'web3'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'
import { constants } from 'ptokens-utils'
import * as utils from 'ptokens-utils'
import PromiEvent from 'promievent'

jest.mock('ptokens-utils', () => {
  const originalModule = jest.requireActual('ptokens-utils')
  const evmCopy = { ...originalModule.evm }
  return { ...originalModule, evm: evmCopy }
})

const PBTC_ON_ETH_MAINNET = 'https://pbtc-node-1a.ngrok.io'
// const PBTC_ON_EOS_MAINNET = 'https://pbtconeos-node-1a.ngrok.io'

const INFURA_MAINNET = 'https://mainnet.infura.io/v3/4762c881ac0c4938be76386339358ed6'
// const EOS_MAINNET_NODE = 'https://eos-mainnet-4.ptokens.io'

test('Should generate correctly a pBTC deposit address on Ethereum Mainnet', async () => {
  const provider = new pTokensNodeProvider(PBTC_ON_ETH_MAINNET)
  const node = new pTokensNode(provider)
  const api = new Web3(INFURA_MAINNET)
  const depositAddress = new DepositAddress({
    nativeBlockchain: constants.blockchains.Bitcoin,
    nativeNetwork: constants.networks.BitcoinMainnet,
    hostBlockchain: constants.blockchains.Ethereum,
    hostNetwork: constants.networks.EthereumMainnet,
    hostApi: api,
    node,
  })
  const depositAddressSample = {
    enclavePublicKey: '0367663eeb293b978b495c20dee62cbfba551bf7e05a8381b374af84861ab6de39',
    nonce: 1652286130,
    nativeDepositAddress: '3Ak5KkZ66PQ6koNoWai6SB3Pi31Z8sGFF6',
  }
  const spy = jest.spyOn(node, 'getNativeDepositAddress').mockResolvedValue(depositAddressSample)
  await depositAddress.generate('bsc-add', 'orig-chain-id', 'dest-chain-id')
  expect(spy).toBeCalledWith('bsc-add', 'orig-chain-id', 'dest-chain-id')
  expect(depositAddress.verify()).toBe(true)
  const mock = () => {
    const promi = new PromiEvent<string>((resolve) =>
      setImmediate(() => {
        promi.emit('broadcasted')
        promi.emit('confirmed')
        resolve('native-tx-id')
      })
    )
    return promi
  }
  const monitorUtxoSpy = jest.spyOn(utils.utxo.btc.prototype, 'monitorUtxoByAddress').mockImplementation(mock)
  const getTxStatusSpy = jest
    .spyOn(pTokensNode.prototype, 'getTransactionStatus')
    .mockResolvedValue({ inputs: ['native-tx-id'], outputs: ['host-tx-id'] })
  jest.spyOn(utils.evm, 'waitForTransactionConfirmation').mockImplementation(() => Promise.resolve('tx-receipt'))
  let isNativeTxBroadcasted = false
  let isNativeTxConfirmed = false
  let isHostTxConfirmed: string
  const hostTxId = await depositAddress
    .waitForDeposit('0x1')
    .on('nativeTxBroadcasted', () => {
      isNativeTxBroadcasted = true
    })
    .on('nativeTxConfirmed', () => {
      isNativeTxConfirmed = true
    })
    .on('hostTxConfirmed', (_receipt) => {
      isHostTxConfirmed = _receipt
    })
  expect(monitorUtxoSpy).toBeCalledWith(depositAddressSample.nativeDepositAddress, 3000, 1)
  expect(getTxStatusSpy).toBeCalledWith('native-tx-id', '0x1')
  expect(isNativeTxBroadcasted).toBe(true)
  expect(isNativeTxConfirmed).toBe(true)
  expect(isHostTxConfirmed).toBe('tx-receipt')
  expect(hostTxId).toStrictEqual('host-tx-id')
})

// test('Should NOT generate correctly a pBTC deposit address on Ethereum Mainnet', async () => {
//   const wrongNativeNetwork = constants.networks.BitcoinTestnet
//   const node = new Node({
//     pToken: constants.pTokens.pBTC,
//     blockchain: constants.blockchains.Ethereum,
//     provider: new HttpProvider(PBTC_ON_ETH_MAINNET),
//   })
//   const depositAddress = new DepositAddress({
//     nativeBlockchain: constants.blockchains.Bitcoin,
//     nativeNetwork: wrongNativeNetwork,
//     hostBlockchain: constants.blockchains.Ethereum,
//     hostNetwork: constants.networks.EthereumMainnet,
//     hostApi: new Web3(INFURA_MAINNET),
//     node,
//   })
//   await depositAddress.generate(ETH_TESTING_ADDRESS, '', '')
//   expect(depositAddress.verify()).toBe(false)
// })

// test('Should generate correctly a pBTC deposit address on Eos Mainnet', async () => {
//   const node = new Node({
//     pToken: constants.pTokens.pBTC,
//     blockchain: constants.blockchains.Eosio,
//     provider: new HttpProvider(PBTC_ON_EOS_MAINNET),
//   })
//   const depositAddress = new DepositAddress({
//     nativeBlockchain: constants.blockchains.Bitcoin,
//     nativeNetwork: constants.networks.BitcoinMainnet,
//     hostBlockchain: constants.blockchains.Eosio,
//     hostNetwork: constants.networks.EosioMainnet,
//     hostApi: eos.getApi(null, new JsonRpc(EOS_MAINNET_NODE, { fetch }), null),
//     node,
//   })
//   await depositAddress.generate(EOS_TESTING_ACCOUNT, '', '')
//   expect(depositAddress.verify()).toBe(true)
// })

// test('Should NOT generate correctly a pBTC deposit address on Eos Mainnet', async () => {
//   const wrongNativeNetwork = constants.networks.BitcoinTestnet
//   const node = new Node({
//     pToken: constants.pTokens.pBTC,
//     blockchain: constants.blockchains.Eosio,
//     provider: new HttpProvider(PBTC_ON_EOS_MAINNET),
//   })
//   const depositAddress = new DepositAddress({
//     nativeBlockchain: constants.blockchains.Bitcoin,
//     nativeNetwork: wrongNativeNetwork,
//     hostBlockchain: constants.blockchains.Eosio,
//     hostNetwork: constants.networks.EosioMainnet,
//     hostApi: eosio.getApi(null, new JsonRpc(EOS_MAINNET_NODE, { fetch }), null),
//     node,
//   })
//   await depositAddress.generate(EOS_TESTING_ACCOUNT, '', '')
//   expect(depositAddress.verify()).toBe(false)
// })
