foam.INTERFACE({
    package: 'net.nanopay.fx',
    name: 'FXService',
    methods: [
        {
            name: 'getFXRate',
            returns: 'net.nanopay.fx.FXQuote',
            async: true,
            javaThrows: ['java.lang.RuntimeException'],
            args: [
                {
                    name: 'sourceCurrency',
                    type: 'String'
                },
                {
                    name: 'targetCurrency',
                    type: 'String'
                },
                {
                    name: 'sourceAmount',
                    type: 'Long'
                },
                {
                    name: 'destinationAmount',
                    type: 'Long'
                },
                {
                    type: 'String',
                    name: 'fxDirection',
                },
                {
                    name: 'valueDate',
                    type: 'String'// TODO: investigate why java.util.dat can't be used here
                },
                {
                  type: 'Long',
                  name: 'user'
                },
                {
                  type: 'String',
                  name: 'fxProvider'
                }
            ]
        },
        {
            name: 'acceptFXRate',
            returns: 'Boolean',
            async: true,
            javaThrows: ['java.lang.RuntimeException'],
            args: [
                {
                    name: 'quoteId',
                    type: 'String'
                },
                {
                  type: 'Long',
                  name: 'user'
                }
            ]
        }
    ]
});
