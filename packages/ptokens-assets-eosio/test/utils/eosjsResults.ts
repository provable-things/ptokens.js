export const executedGetTransactionResult = {
  block_num: 260582155,
  block_time: '2022-08-02T17:46:57.500',
  id: 'ea2ca390a256283ac55981a75c0832ccffabcd764153fd090ecc2ed28d88c6c7',
  last_irreversible_block: 260721540,
  traces: [],
  trx: {
    receipt: {
      cpu_usage_us: 305,
      net_usage_words: 15,
      status: 'executed',
      trx: [
        1,
        {
          compression: 'none',
          packed_context_free_data: '',
          packed_trx:
            '2c63e962c0297fed0873000000000180a7823457908fe400000000a86cd4450180a7823457908fe400000000a8ed32321880a7823457908fe40000c16ff28623000650574f4d42415400',
          signatures: [
            'SIG_K1_Kh2e2yFWSd74dvF6jpPuRogSxJ3a4ZMy3wMAmGrdXAQEvLE4xVtLjWoFwJhQWzVFEbaHst9nB2K3VCsE7MCNMnd5hoQGrn',
          ],
        },
      ],
    },
    trx: {
      actions: [
        {
          account: 'wmbt.ptokens',
          authorization: [{ actor: 'wmbt.ptokens', permission: 'active' }],
          data: { issuer: 'wmbt.ptokens', maximum_supply: '10000000000.000000 PWOMBAT' },
          hex_data: '80a7823457908fe40000c16ff28623000650574f4d424154',
          name: 'create',
        },
      ],
      context_free_actions: [],
      context_free_data: [],
      delay_sec: 0,
      expiration: '2022-08-02T17:47:24',
      max_cpu_usage_ms: 0,
      max_net_usage_words: 0,
      ref_block_num: 10688,
      ref_block_prefix: 1929964927,
      signatures: [
        'SIG_K1_Kh2e2yFWSd74dvF6jpPuRogSxJ3a4ZMy3wMAmGrdXAQEvLE4xVtLjWoFwJhQWzVFEbaHst9nB2K3VCsE7MCNMnd5hoQGrn',
      ],
      transaction_extensions: [],
    },
  },
}

export const notExecutedGetTransactionResult = {
  block_num: 260582155,
  block_time: '2022-08-02T17:46:57.500',
  id: 'ea2ca390a256283ac55981a75c0832ccffabcd764153fd090ecc2ed28d88c6c7',
  last_irreversible_block: 260721540,
  traces: [],
  trx: {
    receipt: {
      cpu_usage_us: 305,
      net_usage_words: 15,
      status: 'pushed',
      trx: [
        1,
        {
          compression: 'none',
          packed_context_free_data: '',
          packed_trx:
            '2c63e962c0297fed0873000000000180a7823457908fe400000000a86cd4450180a7823457908fe400000000a8ed32321880a7823457908fe40000c16ff28623000650574f4d42415400',
          signatures: [
            'SIG_K1_Kh2e2yFWSd74dvF6jpPuRogSxJ3a4ZMy3wMAmGrdXAQEvLE4xVtLjWoFwJhQWzVFEbaHst9nB2K3VCsE7MCNMnd5hoQGrn',
          ],
        },
      ],
    },
    trx: {
      actions: [
        {
          account: 'wmbt.ptokens',
          authorization: [{ actor: 'wmbt.ptokens', permission: 'active' }],
          data: { issuer: 'wmbt.ptokens', maximum_supply: '10000000000.000000 PWOMBAT' },
          hex_data: '80a7823457908fe40000c16ff28623000650574f4d424154',
          name: 'create',
        },
      ],
      context_free_actions: [],
      context_free_data: [],
      delay_sec: 0,
      expiration: '2022-08-02T17:47:24',
      max_cpu_usage_ms: 0,
      max_net_usage_words: 0,
      ref_block_num: 10688,
      ref_block_prefix: 1929964927,
      signatures: [
        'SIG_K1_Kh2e2yFWSd74dvF6jpPuRogSxJ3a4ZMy3wMAmGrdXAQEvLE4xVtLjWoFwJhQWzVFEbaHst9nB2K3VCsE7MCNMnd5hoQGrn',
      ],
      transaction_extensions: [],
    },
  },
}
