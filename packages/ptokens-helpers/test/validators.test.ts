import { ChainId } from 'ptokens-constants'
import { validators } from '../src/'

describe('chainIdToAddressValidatorMap', () => {
  test('Should get an address validator for every chain ID', () => {
    expect(
      Object.values(ChainId).every(
        (_chainId) => Object.values(validators.chainIdToAddressValidatorMap.get(_chainId)) !== undefined
      )
    ).toBeTruthy()
  })
})

describe('isValidAddressByChainId', () => {
  interface AddressCheck {
    address: string
    expected: boolean
  }
  const evmAddresses: AddressCheck[] = [
    { address: '0xE37c0D48d68da5c5b14E5c1a9f1CFE802776D9FF', expected: true },
    { address: '0xAff4d6793F584a473348EbA058deb8caad77a288', expected: true },
    { address: '0x52908400098527886E0F7030069857D2E4169EE7', expected: true },
    { address: '6xAff4d6793F584a473348EbA058deb8caad77a288', expected: false },
    { address: '0xff4d6793F584a473', expected: false },
    { address: 'aFf4d6793f584a473348ebA058deb8caad77a2885', expected: false },
  ]
  const eosioAddresses: AddressCheck[] = [
    { address: 'bittrexacct1', expected: true },
    { address: 'bittrexacct.', expected: false },
    { address: 'bit.re.acct1', expected: true },
    { address: 'bittrexacct11', expected: false },
    { address: 'binancecleos', expected: true },
    { address: '123456789012', expected: false },
    { address: '12345678.012', expected: false },
    { address: '1234567890123', expected: false },
    { address: '12345678901', expected: false },
    { address: '12345678901@', expected: false },
    { address: 'binancecleoS', expected: false },
    { address: 'pnettest1', expected: true },
    { address: 'a', expected: true },
  ]
  const addressesToCheck = new Map<ChainId, { address: string; expected: boolean }[]>([
    [
      ChainId.AlgorandMainnet,
      [
        { address: 'GONISIUAYDOMHM7VURRAAAP5H6OAWRRBCPXEIOZO3QI7TZKR5GTAQ7WK7Y', expected: true },
        { address: 'LCRDY3LYAANTVS3XRHEHWHGXRTKZYVTX55P5IA2AT5ZDJ4CWZFFZIKVHLI', expected: true },
        { address: 'SP745JJR4KPRQEXJZHVIEN736LYTL2T2DFMG3OIIFJBV66K73PHNMDCZVM', expected: true },
        { address: 'AKHSHWO2TUWE53RMVG6ZUBNAEX6MTYPT76TCIDCDWYUUTK6HCJTZS2HDQU', expected: true },
        { address: '123455', expected: true },
        { address: '123455e4', expected: false },
      ],
    ],
    [ChainId.ArbitrumMainnet, evmAddresses],
    [
      ChainId.BitcoinMainnet,
      [
        { address: '12QeMLzSrB8XH8FvEzPMVoRxVAzTr5XM2y', expected: true },
        { address: '38mKdURe1zcQyrFqRLzR8PRao3iLGEPVsU', expected: true },
        { address: '1oNLrsHnBcR6dpaBpwz3LSwutbUNkNSjs', expected: true },
        { address: '3NJZLcZEEYBpxYEUGewU4knsQRn1WM5Fkt', expected: true },
        { address: 'BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4', expected: true },
        { address: 'tc1qw508d6qejxtdg4y5r3zarvary0c5xw7kg3g4ty', expected: false },
        { address: 'BC13W508D6QEJXTDG4Y5R3ZARVARY0C5XW7KN40WF2', expected: false },
        { address: 'bc1gmk9yu', expected: false },
      ],
    ],
    [
      ChainId.BitcoinTestnet,
      [
        { address: 'tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7', expected: true },
        { address: 'GSa5espVLNseXEfKt46zEdS6jrPkmFghBU', expected: true },
        { address: '2MxKEf2su6FGAUfCEAHreGFQvEYrfYNHvL7', expected: true },
        { address: 'mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef', expected: true },
      ],
    ],
    [ChainId.BscMainnet, evmAddresses],
    [ChainId.EosMainnet, eosioAddresses],
    [ChainId.EthereumMainnet, evmAddresses],
    [ChainId.FantomMainnet, evmAddresses],
    [ChainId.LibreMainnet, eosioAddresses],
    [ChainId.LuxochainMainnet, evmAddresses],
    [ChainId.PolygonMainnet, evmAddresses],
    [ChainId.TelosMainnet, eosioAddresses],
    [ChainId.UltraMainnet, eosioAddresses],
    [ChainId.XdaiMainnet, evmAddresses],
  ])

  test('Should correctly check address validity', () => {
    expect(Object.values(ChainId).every((_chainId) => addressesToCheck.get(_chainId) !== undefined)).toBeTruthy()
    Object.values(ChainId).map((_chainId) =>
      addressesToCheck
        .get(_chainId)
        ?.map((_a) => expect(validators.isValidAddressByChainId(_a.address, _chainId)).toBe(_a.expected))
    )
  })
})
