/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
    package: 'net.nanopay.fx',
    name: 'ExchangeRateQuote',

    requires: [
        'net.nanopay.fx.ExchangeRateFields',
        'net.nanopay.fx.FeesFields',
        'net.nanopay.fx.DeliveryTimeFields',
        'net.nanopay.fx.ExchangeRateStatus'
    ],

    properties: [{
            class: 'String',
            name: 'code'
        },
        {
            class: 'String',
            name: 'id'
        },
        {
            class: 'FObjectProperty',
            of: 'net.nanopay.fx.ExchangeRateFields',
            name: 'exchangeRate',
            factory: function() {
                return this.ExchangeRateFields.create();
            }
        },
        {
            class: 'FObjectProperty',
            of: 'net.nanopay.fx.FeesFields',
            name: 'fee',
            factory: function() {
                return this.FeesFields.create();
            }
        },
        {
            class: 'FObjectProperty',
            of: 'net.nanopay.fx.DeliveryTimeFields',
            name: 'deliveryTime',
            factory: function() {
                return this.DeliveryTimeFields.create();
            }

        },
        {
            class: 'foam.core.Enum',
            name: 'status',
            of: 'net.nanopay.fx.ExchangeRateStatus'
        },

    ]
});
