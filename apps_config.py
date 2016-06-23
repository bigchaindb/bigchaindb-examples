APPS = [
    {
        'name': 'ontherecord',
        'num_accounts': 3,
        'num_assets': 0,
        'ledger': 0,
        'payload_func': (
            lambda x: {
                'app': 'ontherecord',
                'content': x
            }
        )
    },
    {
        'name': 'sharetrader',
        'num_accounts': 5,
        'num_assets': 64,
        'ledger': 1,
        'payload_func': (
            lambda i: {
                'app': 'sharetrader',
                'content': {
                    'x': int(i / 8),
                    'y': int(i % 8)
                }
            }
        )
    },
    {
        'name': 'interledger',
        'accounts': [
            {
                'name': 'alice',
                'ledgers': [
                    {
                        'id': 2,
                        'num_assets': 3
                    }
                ]
            },
            {
                'name': 'bob',
                'ledgers': [
                    {
                        'id': 2,
                        'num_assets': 3
                    }
                ]
            },
            {
                'name': 'chloe',
                'ledgers': [
                    {
                        'id': 2,
                        'num_assets': 3
                    },
                    {
                        'id': 3,
                        'num_assets': 3
                    }
                ]
            }
        ],
        'payload_func': (
            lambda x: {
                'app': 'interledger',
                'content': x
            }
        )
    }
]
