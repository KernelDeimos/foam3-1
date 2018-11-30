foam.CLASS({
  package: 'net.nanopay.util',
  name: 'FormValidation',

  exports: [
    'validateAccountNumber',
    'validateAddress',
    'validateAge',
    'validateCity',
    'validateEmail',
    'validateInstitutionNumber',
    'validateNorthAmericanPhoneNumber',
    'validatePassword',
    'validatePhoneCountryCode',
    'validatePhone',
    'validatePostalCode',
    'validateStreetNumber',
    'validateTitleNumOrAuth',
    'validateTransitNumber',
    'validateWebsite'
  ],

  methods: [
    function validatePhoneCountryCode(number) {
      // based off patterns listed at https://countrycode.org/
      var re = /^[+]?\d{1,3}$|^[+]?\d{1,2}[-]?\d{3,4}$/;
      return re.test(String(number));
    },

    function validateNorthAmericanPhoneNumber(number) {
      var re = /^\d{3}[\-]?\d{3}[\-]?\d{4}$/;
      return re.test(String(number));
    },

    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    },

    function validatePhone(number) {
      var re = /([+]?\d{1,2}[.-\s]?)?(\d{3}[.-]?){2}\d{4}/g;
      return re.test(String(number));
    },

    function validateStreetNumber(streetNumber) {
      var re = /^[0-9 ]{1,16}$/;
      return re.test(String(streetNumber));
    },

    function validateAddress(address) {
      var re = /^[#a-zA-Z0-9 ]{1,70}$/;
      return re.test(String(address));
    },

    function validatePostalCode(code) {
      var re = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
      return re.test(String(code));
    },

    function validateCity(city) {
      var re = /^[a-zA-Z ]{1,35}$/;
      return re.test(String(city));
    },

    function validatePassword(password) {
      var re = /^.{6,}$/;
      return re.test(String(password));
    },

    function validateWebsite(website) {
      var re = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/;
      return re.test(String(website));
    },

    function validateTitleNumOrAuth(issuingAuthority) {
      var re = /^[a-zA-Z0-9 ]{1,35}$/;
      return re.test(String(issuingAuthority));
    },

    function validateAccountNumber(accountNumber) {
      var re = /^[0-9 ]{1,30}$/;
      return re.test(String(accountNumber));
    },

    function validateTransitNumber(transitNumber) {
      var re = /^[0-9 ]{5}$/;
      return re.test(String(transitNumber));
    },

    function validateAge(date) {
      if ( ! date ) return false;
      var year = date.getFullYear();
      var currentYear = new Date().getFullYear();
      return currentYear - year >= 16;
    },

    function validateInstitutionNumber(institutionNumber) {
      var re = /^[0-9 ]{3}$/;
      return re.test(String(institutionNumber));
    }
  ]
});
