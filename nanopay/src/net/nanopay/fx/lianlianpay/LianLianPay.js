foam.INTERFACE({
  package: 'net.nanopay.fx.lianlianpay',
  name: 'LianLianPay',

  documentation: 'Interface to the LianLian Pay service',

  methods: [
    {
      name: 'uploadInstructionCombined',
      documentation: '',
      args: [
        {
          name: 'merchantId',
          javaType: 'String'
        },
        {
          name: 'batchId',
          javaType: 'String'
        },
        {
          name: 'request',
          javaType: 'net.nanopay.fx.lianlianpay.model.InstructionCombined'
        }
      ]
    },
    {
      name: 'downloadPreProcessResult',
      documentation: '',
      javaType: 'net.nanopay.fx.lianlianpay.model.PreProcessResult',
      args: [
        {
          name: 'date',
          javaType: 'java.util.Date'
        },
        {
          name: 'merchantId',
          javaType: 'String'
        },
        {
          name: 'batchId',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'downloadReconciliation',
      documentation:
        `LianLian Pay will generate a list of instructions in final status finished during prior accounting
         period (aka previous accounting date) every day and upload the generated file to SFTP server.
         Note: reconciliation file may contain final result for instructions not uploaded on previous day due
         to processing delay.`,
      javaType: 'net.nanopay.fx.lianlianpay.model.Reconciliation',
      args: [
        {
          name: 'date',
          javaType: 'java.util.Date'
        },
        {
          name: 'merchantId',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'downloadStatement',
      documentation:
        `LianLian Pay will generate a list of account fund in / out records which occurred during prior
         accounting period (aka previous accounting date) every day and upload the generated file to SFTP
         server.`,
      javaType: 'net.nanopay.fx.lianlianpay.model.Statement',
      args: [
        {
          name: 'date',
          javaType: 'java.util.Date'
        },
        {
          name: 'merchantId',
          javaType: 'String'
        }
      ]
    }
  ]
});
