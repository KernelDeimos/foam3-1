foam.CLASS({
  package: 'net.nanopay',
  name: 'TempMenu',

  imports: [
    'invoiceDAO',
    'menuDAO',
    'nSpecDAO'
  ],

  documentation: 'Temporary menu data.',
  
  methods: [
    function init() {

      foam.json.parse([
        {                         id: 'sign-in',          label: 'Sign in',                        handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.auth.ui.SignInView' } } },
        // {                         id: 'dashboard',        label: 'Dashboard',                      handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.invoice.ui.InvoiceDashboardView' } } },
        // {                         id: 'sales',            label: 'Receivable',                        handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.invoice.ui.SalesView' } } },
        // {                         id: 'expenses',         label: 'Payable',                     handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.invoice.ui.ExpensesView'} } },
        { /*parent: 'support',*/  id: 'aaainvoices',      label: 'Invoices',                       handler: { class: 'foam.nanos.menu.DAOMenu',  daoKey: 'invoiceDAO' } },
 //       { parent: 'support',  id: 'data',         label: 'View Data',            handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.b2b.DebugView' } } }
      ], foam.nanos.menu.Menu, this.__context__).forEach(this.menuDAO.put.bind(this.menuDAO));
    }
  ]
});