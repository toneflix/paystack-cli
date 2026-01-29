import { XEvent, XGeneric } from 'src/Contracts/Generic'

const webhook: Record<XEvent, { event: XEvent; data: XGeneric }> = {
    'charge.success': {
        event: 'charge.success',
        data: {
            id: 302961,
            domain: 'test',
            status: 'success',
            reference: 'qTPrJoy9Bx',
            amount: 10000,
            message: null,
            gateway_response: 'Approved by Financial Institution',
            paid_at: '2016-09-30T21:10:19.000Z',
            created_at: '2016-09-30T21:09:56.000Z',
            channel: 'card',
            currency: 'NGN',
            ip_address: '41.242.49.37',
            metadata: 0,
            log: {
                time_spent: 16,
                attempts: 1,
                authentication: 'pin',
                errors: 0,
                success: false,
                mobile: false,
                input: [],
                channel: null,
                history: [
                    {
                        type: 'input',
                        message: 'Filled these fields: card number, card expiry, card cvv',
                        time: 15,
                    },
                    {
                        type: 'action',
                        message: 'Attempted to pay',
                        time: 15,
                    },
                    {
                        type: 'auth',
                        message: 'Authentication Required: pin',
                        time: 16,
                    },
                ],
            },
            fees: null,
            customer: {
                id: 68324,
                first_name: 'BoJack',
                last_name: 'Horseman',
                email: 'bojack@horseman.com',
                customer_code: 'CUS_qo38as2hpsgk2r0',
                phone: null,
                metadata: null,
                risk_action: 'default',
            },
            authorization: {
                authorization_code: 'AUTH_f5rnfq9p',
                bin: '539999',
                last4: '8877',
                exp_month: '08',
                exp_year: '2020',
                card_type: 'mastercard DEBIT',
                bank: 'Guaranty Trust Bank',
                country_code: 'NG',
                brand: 'mastercard',
            },
            plan: {},
        },
    },
    'transfer.success': {
        event: 'transfer.success',
        data: {
            domain: 'test',
            amount: 10000,
            currency: 'NGN',
            source: 'balance',
            source_details: null,
            reason: 'Bless you',
            recipient: {
                domain: 'test',
                type: 'nuban',
                currency: 'NGN',
                name: 'Someone',
                details: {
                    account_number: '0123456789',
                    account_name: null,
                    bank_code: '058',
                    bank_name: 'Guaranty Trust Bank',
                },
                description: null,
                metadata: null,
                recipient_code: 'RCP_xoosxcjojnvronx',
                active: true,
            },
            status: 'success',
            transfer_code: 'TRF_zy6w214r4aw9971',
            transferred_at: '2017-03-25T17:51:24.000Z',
            created_at: '2017-03-25T17:48:54.000Z',
        },
    },
    'subscription.create': {
        event: 'subscription.create',
        data: {
            domain: 'test',
            status: 'active',
            subscription_code: 'SUB_vsyqdmlzble3uii',
            amount: 50000,
            cron_expression: '0 0 28 * *',
            next_payment_date: '2016-05-19T07:00:00.000Z',
            open_invoice: null,
            createdAt: '2016-03-20T00:23:24.000Z',
            plan: {
                name: 'Monthly retainer',
                plan_code: 'PLN_gx2wn530m0i3w3m',
                description: null,
                amount: 50000,
                interval: 'monthly',
                send_invoices: true,
                send_sms: true,
                currency: 'NGN',
            },
            authorization: {
                authorization_code: 'AUTH_96xphygz',
                bin: '539983',
                last4: '7357',
                exp_month: '10',
                exp_year: '2017',
                card_type: 'MASTERCARD DEBIT',
                bank: 'GTBANK',
                country_code: 'NG',
                brand: 'MASTERCARD',
            },
            customer: {
                first_name: 'BoJack',
                last_name: 'Horseman',
                email: 'bojack@horsinaround.com',
                customer_code: 'CUS_xnxdt6s1zg1f4nx',
                phone: '',
                metadata: {},
                risk_action: 'default',
            },
            created_at: '2016-10-01T10:59:59.000Z',
        },
    },
    'transfer.failed': {
        event: 'transfer.failed',
        data: {
            domain: 'test',
            amount: 10000,
            currency: 'NGN',
            source: 'balance',
            source_details: null,
            reason: 'Test',
            recipient: {
                domain: 'test',
                type: 'nuban',
                currency: 'NGN',
                name: 'Test account',
                details: {
                    account_number: '0000000000',
                    account_name: null,
                    bank_code: '058',
                    bank_name: 'Zenith Bank',
                },
                description: null,
                metadata: null,
                recipient_code: 'RCP_7um8q67gj0v4n1c',
                active: true,
            },
            status: 'failed',
            transfer_code: 'TRF_3g8pc1cfmn00x6u',
            transferred_at: null,
            created_at: '2017-12-01T08:51:37.000Z',
        },
    },
    'customeridentification.failed': {
        'event': 'customeridentification.failed',
        'data': {
            'customer_id': 82796315,
            'customer_code': 'CUS_XXXXXXXXXXXXXXX',
            'email': 'email@email.com',
            'identification': {
                'country': 'NG',
                'type': 'bank_account',
                'bvn': '123*****456',
                'account_number': '012****345',
                'bank_code': '999991'
            },
            'reason': 'Account number or BVN is incorrect'
        }
    },
    'customeridentification.success': {
        'event': 'customeridentification.success',
        'data': {
            'customer_id': '9387490384',
            'customer_code': 'CUS_xnxdt6s1zg1f4nx',
            'email': 'bojack@horsinaround.com',
            'identification': {
                'country': 'NG',
                'type': 'bvn',
                'value': '200*****677'
            }
        }
    },
    'dedicatedaccount.assign.failed': {
        'event': 'dedicatedaccount.assign.failed',
        'data': {
            'customer': {
                'id': 100110,
                'first_name': 'John',
                'last_name': 'Doe',
                'email': 'johndoe@test.com',
                'customer_code': 'CUS_hcekca0j0bbg2m4',
                'phone': '+2348100000000',
                'metadata': {},
                'risk_action': 'default',
                'international_format_phone': '+2348100000000'
            },
            'dedicated_account': null,
            'identification': {
                'status': 'failed'
            }
        }
    },
    'dedicatedaccount.assign.success': {
        'event': 'dedicatedaccount.assign.success',
        'data': {
            'customer': {
                'id': 100110,
                'first_name': 'John',
                'last_name': 'Doe',
                'email': 'johndoe@test.com',
                'customer_code': 'CUS_hp05n9khsqcesz2',
                'phone': '+2348100000000',
                'metadata': {},
                'risk_action': 'default',
                'international_format_phone': '+2348100000000'
            },
            'dedicated_account': {
                'bank': {
                    'name': 'Test Bank',
                    'id': 20,
                    'slug': 'test-bank'
                },
                'account_name': 'PAYSTACK/John Doe',
                'account_number': '1234567890',
                'assigned': true,
                'currency': 'NGN',
                'metadata': null,
                'active': true,
                'id': 987654,
                'created_at': '2022-06-21T17:12:40.000Z',
                'updated_at': '2022-08-12T14:02:51.000Z',
                'assignment': {
                    'integration': 100123,
                    'assignee_id': 100110,
                    'assignee_type': 'Customer',
                    'expired': false,
                    'account_type': 'PAY-WITH-TRANSFER-RECURRING',
                    'assigned_at': '2022-08-12T14:02:51.614Z',
                    'expired_at': null
                }
            },
            'identification': {
                'status': 'success'
            }
        }
    }
}

export default webhook