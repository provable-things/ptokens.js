import utils from '../src'
import Web3 from 'web3'
import { TransactionReceipt, PromiEvent as Web3PromiEventType } from 'web3-core'
import Web3PromiEvent from 'web3-core-promievent'
import PromiEvent from 'promievent'

const TEST_ETH_PROVIDER = 'https://kovan.infura.io/v3/4762c881ac0c4938be76386339358ed6'
const TEST_ETH_PRIVATE_KEY = '422c874bed50b69add046296530dc580f8e2e253879d98d66023b7897ab15742'

// test('dddd', async () => {
//   const promiEvent = new PromiEvent<number>((resolve, reject) => {
//     let counter = 0

//     const timer = setInterval(() => {
//       counter++
//       console.log(promiEvent)
//       promiEvent.emit('interval', counter)

//       if (counter === 1) {
//         promiEvent.emit('first', counter)
//       }

//       if (counter === 10) {
//         promiEvent.emit('last', counter)
//         resolve(counter)

//         // stop the timer
//         clearInterval(timer)
//       }
//     }, 100)
//   })
//   void promiEvent.on('interval', (count: number) => {
//     console.log(`interval number ${count}`)
//   })
//   await promiEvent
// })

jest.setTimeout(5000)

describe('redeem from evm', () => {
  test('TODO', () => {
    expect(true).toBe(true)
  })
  // test('Should wait for an ETH transaction confirmation', async () => {
  //   const web3 = new Web3(TEST_ETH_PROVIDER)
  //   const account = web3.eth.accounts.privateKeyToAccount(utils.evm.addHexPrefix(TEST_ETH_PRIVATE_KEY))
  //   web3.eth.defaultAccount = account.address
  //   // jest.spyOn(web3.eth, 'getTransactionCount').mockResolvedValue(1)
  //   // jest.spyOn(web3.eth, 'getGasPrice').mockResolvedValue('5e9')
  //   jest.spyOn(web3.eth, 'sendSignedTransaction').mockImplementation(() => {
  //     console.info('bbbbbbb')
  //     const promi = Web3PromiEvent()
  //     setInterval(() => promi.eventEmitter.emit('transactionHash', 'a-hash'), 50)
  //     setInterval(() => promi.eventEmitter.emit('receipt', 'receipt') || promi.resolve({ block: 1 }), 100)
  //     return promi.eventEmitter
  //   })
  //   const promievent = utils.redeemFrom.redeemFromEvmCompatible(
  //     web3,
  //     { privateKey: TEST_ETH_PRIVATE_KEY },
  //     [1, 'destinationAccount'],
  //     'broadcastEventName'
  //   )
  //   // let hash = undefined
  //   // void promievent.on('broadcastEventName', (_hash) => {
  //   //   hash = _hash
  //   // })
  //   const ret = await promievent
  //   // expect(hash).toStrictEqual('a-hash')
  //   expect(ret).toStrictEqual({ block: 1 })
  //   expect(web3.eth.sendSignedTransaction).toHaveBeenCalledWith(expect.stringContaining('0x'))
  // })
})
