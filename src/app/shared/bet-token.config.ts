export const betTokenInterface = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
        value: 'GinésCoinTest'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'approve',
    outputs: [
      {
        name: 'success',
        type: 'bool'
      }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: 'dripToMe',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
        value: '1000'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: '',
        type: 'uint256'
      }
    ],
    name: 'bets',
    outputs: [
      {
        name: 'from',
        type: 'address'
      },
      {
        name: 'against',
        type: 'address'
      },
      {
        name: 'bet',
        type: 'string'
      },
      {
        name: 'date',
        type: 'uint256'
      },
      {
        name: 'amount',
        type: 'uint256'
      },
      {
        name: 'accepted',
        type: 'bool'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address'
      },
      {
        name: '_to',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: 'success',
        type: 'bool'
      }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      }
    ],
    name: 'availableBalanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
        value: '0'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
        value: '0'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'version',
    outputs: [
      {
        name: '',
        type: 'string',
        value: '1.0'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_bet',
        type: 'uint256'
      },
      {
        name: '_accept',
        type: 'bool'
      }
    ],
    name: 'acceptBet',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address'
      }
    ],
    name: 'drip',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      }
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
        value: '0'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_bet',
        type: 'uint256'
      }
    ],
    name: 'cryAndForgotBet',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'owner',
    outputs: [
      {
        name: '',
        type: 'address',
        value: '0x57d2d793efd81cb76af623249920cc5bd35ebba9'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'myDebt',
    outputs: [
      {
        name: 'debt',
        type: 'uint256',
        value: '0'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
        value: 'GNST'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'transfer',
    outputs: [
      {
        name: 'success',
        type: 'bool'
      }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_bet',
        type: 'uint256'
      }
    ],
    name: 'giveMeTheMoney',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_against',
        type: 'address'
      },
      {
        name: '_amount',
        type: 'uint256'
      },
      {
        name: '_bet',
        type: 'string'
      }
    ],
    name: 'bet',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      }
    ],
    name: 'debtOf',
    outputs: [
      {
        name: 'debt',
        type: 'uint256',
        value: '0'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      },
      {
        name: '_spender',
        type: 'address'
      }
    ],
    name: 'allowance',
    outputs: [
      {
        name: 'remaining',
        type: 'uint256',
        value: '0'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        name: '_initialAmount',
        type: 'uint256',
        index: 0,
        typeShort: 'uint',
        bits: '256',
        displayName: '&thinsp;<span class=\'punctuation\'>_</span>&thinsp;initial Amount',
        template: 'elements_input_uint',
        value: '1000'
      },
      {
        name: '_tokenName',
        type: 'string',
        index: 1,
        typeShort: 'string',
        bits: '',
        displayName: '&thinsp;<span class=\'punctuation\'>_</span>&thinsp;token Name',
        template: 'elements_input_string',
        value: 'GinésCoinTest'
      },
      {
        name: '_decimalUnits',
        type: 'uint8',
        index: 2,
        typeShort: 'uint',
        bits: '8',
        displayName: '&thinsp;<span class=\'punctuation\'>_</span>&thinsp;decimal Units',
        template: 'elements_input_uint',
        value: '0'
      },
      {
        name: '_tokenSymbol',
        type: 'string',
        index: 3,
        typeShort: 'string',
        bits: '',
        displayName: '&thinsp;<span class=\'punctuation\'>_</span>&thinsp;token Symbol',
        template: 'elements_input_string',
        value: 'GNST'
      }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_from',
        type: 'address'
      },
      {
        indexed: true,
        name: '_to',
        type: 'address'
      },
      {
        indexed: false,
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'Transfer',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_owner',
        type: 'address'
      },
      {
        indexed: true,
        name: '_spender',
        type: 'address'
      },
      {
        indexed: false,
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'Approval',
    type: 'event'
  }
];
