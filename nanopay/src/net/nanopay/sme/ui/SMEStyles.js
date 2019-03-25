foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SMEStyles',
  extends: 'foam.u2.View',

  documentation: 'SME CSS that is used through out',

  css: `
    .label, .infoLabel {
      font-size: 12px !important;
      color: #2b2b2b !important;
      padding-bottom: 6px !important;
      font-weight: 400 !important;
      display: block !important;
    }
    .sme-inputContainer {
      margin-top: 1%;
    }
    body {
      font-family: 'Lato', sans-serif;
      background: #f9fbff;
    }
    .stack-wrapper {
      height: 100%;
      padding: 0;
      background: #f9fbff;
    }
    .full-screen {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
    }
    .app-link {
      margin-left: 5px;
      color: #604aff;
      cursor: pointer;
    }
    .cover-img-block {
      margin: 50px;
      margin-left: 0px;
      margin-top: 0px;
    }
    .sme-image {
      display: inline-block;
      width: 100%;
      margin-top: 20vh;
    }
    .sme-text-block {
      top: 20%;
      left: 25%;
      position: absolute;
    }
    .forgot-link {
      margin-left: 0px;
      color: #604aff;
      cursor: pointer;
      text-align: center;
    }
    .sme-noselect {
      -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Safari */
      -khtml-user-select: none; /* Konqueror HTML */
      -moz-user-select: none; /* Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
      user-select: none; /* Non-prefixed version, currently
                            supported by Chrome and Opera */
    }
    .foam-u2-search-TextSearchView input {
      background-image: url("images/ic-search.svg");
      background-repeat: no-repeat;
      background-position: 8px;
      border-radius: 2px;
      border: 1px solid #dce0e7;
      color: #093649;
      font-size: 14px;
      height: 40px;
      padding: 0 21px 0 38px;
    }
    .foam-u2-stack-StackView {
      height: 100%;
      width: 100%;
    }

    input {
      border: solid 1px #8e9090;
      border-radius: 3px;
      padding: 12px;
      font-size: 14px;
      font-family: 'Lato', sans-serif;
    }

    input:focus {
      border: solid 1px #604aff;
    }

    /* Modal windows */

    .foam-u2-dialog-Popup-inner {
      box-shadow: 0 24px 24px 0 rgba(0, 0, 0, 0.12), 0 0 24px 0 rgba(0, 0, 0, 0.15);
      border-radius: 3px;
      overflow: hidden;
    }

    .container {
      width: 510px !important;
    }

    .innerContainer {
      padding: 24px;
      margin: 0px !important;
      width: auto !important;
    }

    .popUpHeader {
      background: #fff !important;
      color: #2b2b2b !important;
      padding: 24px 24px 16px 24px !important;
      width: auto !important;
      height: auto !important;
    }

    .popUpTitle {
      font-weight: 900 !important;
      font-size: 24px !important;
      color: #2b2b2b !important;
      margin: 0px !important;
    }

    .styleMargin {
      background: #fafafa;
      overflow: hidden;
      margin-top: 0 !important;
      padding: 24px !important;
    }

    .net-nanopay-ui-ActionView-addButton,
    .net-nanopay-ui-ActionView-saveButton {
      float: right;
      margin-bottom: 0px !important;
      width: 135px !important;
    }

    .net-nanopay-ui-ActionView-closeButton {
      margin-right: 0px !important;
    }

    .checkbox-label {
      font-size: 16px;
    }

    /* Sidebar */

    .sme-sidenav-item-wrapper,
    .sme-quick-action-wrapper {
      border-left: 4px solid #fff;
      font-weight: normal;
    }

    .sme-sidenav-item-wrapper:hover,
    .sme-quick-action-wrapper:hover,
    .active-menu {
      background: #f3f2ff;
      cursor: pointer;
      border-left: 4px solid #604aff;
      color: #604aff;
      font-weight: 600;
    }

    /* Styles related to rich choice view */
    .net-nanopay-sme-SMEController .foam-u2-view-RichChoiceView {
      display: block;
    }

    .net-nanopay-sme-SMEController .foam-u2-view-RichChoiceView-container {
      border: 1px solid #bdbdbd;
      border-radius: 4px;
      width: 100%;
      z-index: 1;
      -webkit-appearance: none;
    }

    .net-nanopay-sme-SMEController .foam-u2-view-RichChoiceView-heading {
      font-weight: bold;
      border-bottom: 1px solid #f4f4f9;
      line-height: 24px;
      font-size: 14px;
      color: #333;
      font-weight: 900;
      padding: 6px 16px;
    }

    .net-nanopay-sme-SMEController .foam-u2-view-RichChoiceView-selection-view {
      min-height: 40px;
      width: 100%;
      border-radius: 4px;
      border: solid 1px #8e9090;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
      font-size: 14px;
      box-sizing: border-box;
      margin-bottom: 4px;
      -webkit-appearance: none;
      cursor: pointer;
    }

    .net-nanopay-sme-SMEController .foam-u2-view-RichChoiceView-chevron::before {
      color: #bdbdbd;
      font-size: 17px;
      padding-left: 8px;
    }

    h1 {
      font-weight: 900;
      font-size: 32px;
    }

    h2 {
      font-weight: 700;
      font-size: 24px;
      line-height: 36px;
    }

    /* Containers */

    .half-container {
      width: 47%;
      display: inline-block;
    }
    .left-of-container {
      margin-right: 29px;
    }

    /* Inputs */

    .input-label {
      padding-bottom: 8px;
      font-weight: 400;
      font-size: 12px;
    }

    .input-wrapper {
      margin-top: 16px;
    }

    .input-field-wrapper {
      position: relative;
    }

    .input-field {
      width: 100%;
      font-size: 14px !important;
      height: 40px !important;
      border: solid 1px #8e9090 !important;
      background: #fff !important;
      border-radius: 3px !important;
      font-weight: 400 !important;
      padding: 12px !important;
      box-shadow: none !important;
    }

    textarea.input-field {
      height: auto;
    }

    .input-field.image {
      padding-right: 30px;
    }

    .input-double-left {
      display: inline-block;
      width: calc((100% - 2%) / 2);
    }
    .input-double-right {
      display: inline-block;
      width: calc((100% - 2%) / 2);
      margin-left: 2%;
    }

    .foam.u2.tag.TextArea {
      width: 100%;
      font-size: 14px;
      height: 40px;
      border: solid 1px #8e9090;
      border-radius: 3px;
      padding: 12px;
    }

    .sme-half-field {
      height: 40px;
      width: 100%;
      font-size: 14px;
      border-radius: 4px;
    }
    .sme-full-field {
      height: 40px;
      width: 100%;
      font-size: 14px;
      border-radius: 4px;
    }

    .block {
      width: 100% !important;
    }
    .login {
      margin-top: 24px !important;
    }
    .sme-button {
      border-radius: 4px !important;
      background-color: #604aff;
      font-size: 16px !important;
      font-family: 'Lato', sans-serif;
      height: 48px !important;
      margin-top: 0px;
      color: #fff;
    }
    .sme-button:hover {
      background: #4d38e1 !important;
    }

    .sme-title {
      font-size: 32px;
      line-height: 1.5;
      letter-spacing: 0.5px;
      text-align: left;
      color: #353535;
      margin-bottom: 24px;
      font-weight: 900;
    }
    .sme-subTitle {
      font-size: 14px;
      letter-spacing: 0.5px;
      text-align: center;
      color: #093400;
      font-weight: 300;
      margin-bottom: 15px;
      margin-top: 16px;
      line-height: 24px;
    }

    /* Buttons Reference the following component style guide: https://app.zeplin.io/project/5bea24519befb87e8387dec8/screen/5bea260ad4ba093cf835ae49 */
    .white-radio {
      text-align: left !important;
      text-indent: 50px;
      width: 225px !important;
      height: 44px !important;
      border: 1px solid #8e9090 !important;
      border-radius: 4px !important;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05) !important;
      background-repeat: no-repeat;
      background-position-x: 25px;
      background-position-y: 13px;
      background-image: url(images/ablii/radio-resting.svg);
      color: %PRIMARYCOLOR% !important;
      background-color: white !important;
      font-size: 16px !important;
      font-family: 'Lato', sans-serif;
    }
    .white-radio.selected {
      border: 1px solid %SECONDARYCOLOR% !important;
      background-image: url(images/ablii/radio-active.svg);
    }
    }
    .sme.button {
      font-size: 16px;
      border-radius: 4px;
      font-weight: 500;
      width: 128px;
      height: 48px;
      cursor: pointer;
      text-align: center;
      font-family: 'Lato', sans-serif !important;
    }

    .sme.button:focus {
      outline: none;
    }

    .sme.button:active {
      box-shadow: inset 0 2px 1px 0 rgba(32, 46, 120, 0.54);
    }

    .sme.button.secondary:active {
      box-shadow: inset 0 2px 1px 0 rgba(32, 46, 120, 0.34);
    }

    .sme.button.primary {
      background: #604aff;
      color: #fff;
      border: none;
    }

    .sme.button.primary:hover {
      background: #4d38e1;
    }

    .sme.button.secondary {
      background: #fff;
      color: #604aff;
      border: 1px solid #604aff;
    }

    .sme.button.secondary:hover {}

    .sme.button.error {
      background: #f91c1c;
      color: #fff;
      border: none;
    }

    .sme.button.error:hover {
      background: #da1818;
    }

    .sme.button.error.secondary {
      background: #fff;
      color: #f91c1c;
      border: 1px solid #f91c1c;
    }

    .sme.button.medium {
      width: 96px;
      height: 36px;
      font-size: 14px;
    }

    .sme.button.small {
      width: 70px;
      height: 24px;
      font-size: 10px;
    }

    .sme.button.error.secondary:hover {}

    /* Link */

    .sme.link {
      font-size: 16px;
      font-weight: 500;
      color: #604aff;
      cursor: pointer;
      font-family: 'Lato', sans-serif !important;
      background: none;
      line-height: 16px;
      padding: 0px;
      height: auto;
      width: auto;
      margin-right: 30px;
    }

    .sme.link:hover {
      color: #604aff;
    }

    .sme.link:hover .icon {
      display: none;
    }

    .sme.link:hover .icon.hover {
      display: inline-block;
    }

    .sme.link .icon {
      margin-right: 8px;
    }

    .sme.link .icon.hover {
      display: none;
    }

    /* Link Button */

    .sme.link-button {
      font-size: 16px;
      font-weight: 500;
      color: var(--blue-grey);
      cursor: pointer;
      font-family: 'Lato', sans-serif !important;
      background: none;
      line-height: 16px;
      padding: 0px;
      height: auto;
      width: auto;
      margin-right: 30px;
    }

    .sme.link-button:hover {
      color: #604aff;
    }

    .sme.link-button:hover .icon {
      display: none;
    }

    .sme.link-button:hover .icon.hover {
      display: inline-block;
    }

    .sme.link-button .icon {
      margin-right: 8px;
    }

    .sme.link-button .icon.hover {
      display: none;
    }

    /* Text Reference the following component style guide: https://app.zeplin.io/project/5bea24519befb87e8387dec8/screen/5bea26293d02ff3d04f8892d */

    .x-large-header {
      /* InvoiceOverview Header format length */
      font-size: 32px;
      font-weight: 900;
      line-height: 1.5;
      max-width: 600px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .large-header {
      font-size: 32px;
      line-height: 48px;
      font-weight: 900;
    }

    .medium-header {
      font-size: 24px;
      line-height: 36px;
      font-weight: 900;
    }

    .medium-intro {
      font-size: 24px;
      line-height: 36px;
      font-weight: 400;
    }

    .sub-heading {
      font-size: 16px;
      line-height: 24px;
      font-weight: 700;
    }

    .body-paragraph {
      font-size: 16px;
      line-height: 24px;
      font-weight: 400;
    }

    .table-heading {
      font-size: 14px;
      font-weight: 700;
      line-height: 21px;
    }

    .table-content {
      font-size: 14px;
      line-height: 21px;
      font-weight: 400;
      color: #2b2b2b;
    }

    .table-heading {
      font-size: 14px;
      line-height: 15px;
      font-weight: 900;
    }

    .bold-label {
      font-size: 14px;
      font-weight: 900;
      line-height: 15px;
    }

    .form-label {
      font-size: 12px;
      font-weight: 700;
      line-height: 15px;
    }

    .subdued-text {
      color: #8e9090;
    }

    .caption {
      font-size: 10px;
      line-height: 14px;
      font-weight: normal;
    }

    .subdued-text {
      color: #8e9090;
      opacity: 0.7;
    }

    /* Card Styles Reference the following component style guide: https://app.zeplin.io/project/5bea24519befb87e8387dec8/screen/5bea260a9befb87e8387e650 */

    .card {
      border-radius: 2px;
      box-shadow: 0 1px 1px 0 #dae1e9;
      border: solid 1px #edf0f5;
      background-color: #ffffff;
    }

    .card:hover {
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      border: solid 1px #e2e2e3;
    }

    .floating-card {
      border-radius: 2px;
      box-shadow: 0 24px 24px 0 rgba(0, 0, 0, 0.12), 0 0 24px 0 rgba(0, 0, 0, 0.15);
      border: solid 1px #e2e2e3;
      background-color: #ffffff;
    }

    .invoice-list-wrapper {
      border-radius: 4px;
      border: 1px solid #e2e2e3;
      overflow: hidden;
    }

    .invoice-list-wrapper > div:last-child > .net-nanopay-sme-ui-InvoiceRowView {
      border: 0;
    }

    .purple-checkmark {
      display: inline-block;
      transform: rotate(45deg);
      height: 20px;
      width: 14px;
      border-bottom: 2px solid #604aff;
      border-right: 2px solid #604aff;
    }

    /*  Radio buttons */
    input[type='radio']:checked:after {
      width: 3px;
      height: 3px;
      border-radius: 15px;
      top: -1px;
      left: -2px;
      position: relative;
      background-color: white;
      content: '';
      display: inline-block;
      visibility: visible;
      border: 6px solid #604aff;
    }

    input[type='checkbox']:checked:after {
      width: 14px;
      height: 14px;
      margin-right: 2px;
      padding-left: 2px;
      position: relative;
      left: -4px;
      top: -2px;
      background-color: white;
      content: '\\2713';
      display: inline-block;
      visibility: visible;
      color: #604aff;
      border-radius: 2px;
      box-shadow: inset 0 1px 1px 0 rgba(32, 46, 120, 0.54);
    }

    .label {
      font-size: 12px !important;
      font-weight: 700 !important;
      line-height: 15px !important;
    }

    .foam-u2-tag-Select:focus {
      border: 1px solid #604aff;
    }

    .foam-u2-tag-Select {
      margin-bottom: 10px;
      background: #fff;
      box-shadow: none;
      height: 40px !important;
      border: solid 1px #8e9090;
      border-radius: 3px;
      font-size: 14px;
    }

    .foam-u2-TextField {
      font-size: 14px;
      height: 40px;
      border: solid 1px #8e9090;
      background: #fff;
      box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
      border-radius: 3px;
      font-weight: 400;
      padding: 12px;
    }

    .foam-u2-DateView {
      font-size: 14px;
      height: 40px;
      border: solid 1px #8e9090;
      background: #fff;
      box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
      border-radius: 3px;
      font-weight: 400;
      padding: 12px;
    }

    .net-nanopay-ui-ActionView-submitButton {
      background-color: #604aff !important;
    }

    /* DAO controller */

    .foam-comics-DAOControllerView-top-row .net-nanopay-ui-ActionView {
      width: 158px !important;
      height: 48px !important;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      border: solid 1px #4a33f4 !important;
      font-family: lato;
      font-size: 16px;
      background: #604aff !important;
    }

    .foam-comics-DAOControllerView .actions .net-nanopay-ui-ActionView {
      display: flex;
      align-items: center;
      background: none !important;
      border: none !important;
      box-shadow: none;
      font-size: 16px;
      font-weight: 500;
      font-family: lato;
      color: #8e9090;
      cursor: pointer;
      line-height: 24px;
      width: auto !important;
      height: 40px;
      margin-left: 28px;
      display: inline-block;
    }

    .foam-comics-DAOControllerView .actions .net-nanopay-ui-ActionView img + span {
      margin-left: 12px;
    }

    .foam-comics-DAOControllerView .actions .net-nanopay-ui-ActionView:hover {
      /* Change the color of the icon to purple */
      filter: hue-rotate(67deg) saturate(100000000) opacity(65%);
    }

    .foam-comics-DAOControllerView-top-row {
      margin-bottom: 20px !important;
    }

    .foam-comics-DAOControllerView-title-container span {
      color: #8e9090;
      height: 24px;
      font-family: 'Lato', sans-serif;
      font-size: 16px;
    }

    .foam-comics-DAOControllerView-title-container h1 span {
      font-size: 32px;
      line-height: 48px;
      font-weight: 900;
      color: #2b2b2b;
    }

    .foam-u2-search-TextSearchView input {
      box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
      border: solid 1px #e2e2e3;
      border-radius: 3px;
      width: 330px;
    }

    .foam-comics-DAOControllerView .foam-u2-view-TableView-row {
      height: 48px;
    }

    .foam-comics-DAOControllerView .foam-u2-view-TableView-row img {
      border-radius: 2px;
    }

    .foam-u2-view-TableView {
      border-style: inherit !important;
      border-collapse: separate !important;
      border-spacing: 0px !important;
      display: inline-table;
    }

    .foam-u2-view-TableView tbody td {
      border-radius: 0px !important;
      border-top: none !important;
    }

    .foam-u2-view-TableView tbodyt tr {
      border-top: none !important;
    }

    .foam-u2-view-TableView tbody tr {
      background: #fff;
    }

    .foam-u2-view-TableView tbody tr:first-child td {
      border-top: solid 1px #e2e2e3 !important;
    }

    .foam-u2-md-overlaydropdown {
      border-radius: 3px;
      padding: 8px 0px;
      box-shadow: 0 24px 24px 0 rgba(0, 0, 0, 0.12), 0 0 24px 0 rgba(0, 0, 0, 0.15) !important;
      width: 200px;
    }

    .foam-u2-md-overlaydropdown::before {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 8px solid transparent;
      border-bottom-color: black;
      -ms-transform: translate(110px, -16px);
      transform: translate(50px, -202px);
    }

    .foam-u2-view-tableview-context-menu-item {
      border-radius: 0px;
      padding: 8px 24px !important;
      font-size: 16px;
      color: #2b2b2b;
    }

    .foam-u2-view-tableview-context-menu-item:hover {
      background: #f3f2ff !important;
      color: #604aff !important;
    }

    .foam-u2-view-SimpleSearch p {
      opacity: 0;
      margin: 0px;
    }

    table {
      width: 1024px !important;
    }

    /* user status styles */

    .user-status-Active {
      color: #07941f;
      display: inline-block;
    }

    .user-status-circle-Active {
      height: 7px;
      width: 7px;
      margin-bottom: 2px;
      margin-right: 4px;
      background-color: #07941f;
      border-radius: 50%;
      display: inline-block;
    }

    .user-status-Disabled {
      color: #424242;
      display: inline-block;
    }

    .user-status-circle-Disabled {
      height: 7px;
      width: 7px;
      margin-bottom: 2px;
      margin-right: 4px;
      background-color: #424242;
      border-radius: 50%;
      display: inline-block;
    }

    .user-status-Invited {
      color: #545d87;
      display: inline-block;
    }

    .user-status-circle-Invited {
      height: 7px;
      width: 7px;
      margin-bottom: 2px;
      margin-right: 4px;
      background-color: #545d87;
      border-radius: 50%;
      display: inline-block;
    }

    /* contact status styles */

    [class*="contact-status"] {
      display: inline-block;
      font-size: 11px;
    }

    [class*="contact-status-circle"] {
      height: 6px;
      width: 6px;
      margin-bottom: 1px;
      margin-right: 4px;
      border-radius: 50%;
    }

    .contact-status-Active {
      color: #07941f;
    }

    .contact-status-circle-Active {
      background-color: #07941f;
    }

    .contact-status-NotInvited {
      color: #424242;
    }

    .contact-status-circle-NotInvited {
      background-color: #424242;
    }

    .contact-status-Invited {
      color: #545d87;
    }

    .contact-status-circle-Invited {
      background-color: #545d87;
    }

    /* Styles for ResetPassword/SigninView/SignupView */

    .top-bar {
      width: 100%;
      border-bottom: solid 1px #e2e2e3;
      background: #fff;
    }
    .top-bar-inner {
      max-width: 1024px;
      margin: auto;
      height: 64px;
    }
    .top-bar img {
      height: 25px;
      margin-top: 20px;
    }
    .top-bar-message {
      background: #b3d8ff;
      text-align: center;
      padding: 14px;
      color: #2b2b2b;
      opacity: 0.8;
    }
    .horizontal-flip {
      -moz-transform: scale(-1, 1);
      -webkit-transform: scale(-1, 1);
      -o-transform: scale(-1, 1);
      -ms-transform: scale(-1, 1);
      transform: scale(-1, 1);
      margin-right: 10px;
    }
    .inline-block {
      display: inline-block;
    }
    .strenght-indicator {
      margin-top: 4px;
    }
    .strenght-indicator .text0 {
      color: #8e9090 !important;
      margin-left: 11px !important;
      font-weight: 400 !important;
    }
    .strenght-indicator .outer {
      background-color: #e2e2e3 !important;
    }

    /* Invoice statuses */

    .generic-status-circle {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 4px;
      margin-bottom: 2px;
    }

    .invoice-status-container {
      display: inline-flex;
      align-items: center;
    }

    .Invoice-Status {
      background: none !important;
      font-weight: 400 !important;
      font-size: 11px !important;
      line-height: 22px;
      display: inline-block;
    }

    .generic-status-circle.Complete {
      background: #07941f;
    }

    .generic-status-circle.Pending-acceptance {
      background: #cf6f0a;
    }

    .Invoice-Status.Pending-acceptance {
      color: #cf6f0a !important;
    }

    .Invoice-Status.Processing {
      color: #cf6f0a !important;
    }

    .generic-status-circle.Processing {
      background: #cf6f0a;
    }

    .Invoice-Status.Complete {
      color: #07941f !important;
    }

    .generic-status-circle.Unpaid {
      background: #545d87;
    }

    .Invoice-Status.Unpaid {
      color: #545d87 !important;
    }

    .generic-status-circle.Overdue {
      background: #d42035;
    }

    .Invoice-Status.Overdue {
      color: #d42035 !important;
    }

    .generic-status-circle.draft {
      border-color: #8b90a6;
      border-style: solid;
      border-width: 1.5px;
      height: 4px;
      width: 4px;
    }

    .Invoice-Status.draft {
      color: #8b90a6 !important;
    }

    .generic-status-circle.pending-approval {
      border-color: #545d87;
      border-style: solid;
      border-width: 1.5px;
      height: 4px;
      width: 4px;
    }

    .Invoice-Status.pending-approval {
      color: #545d87 !important;
    }

    .generic-status-circle.depositing-money {
      background: #cf6f0a;
    }

    .Invoice-Status.depositing-money {
      color: #cf6f0a !important;
    }

    .generic-status-circle.pending {
      background: #cf6f0a;
    }

    .Invoice-Status.pending {
      color: #cf6f0a !important;
    }

    .generic-status-circle.void {
      background: #424242;
    }

    .Invoice-Status.void {
      color: #424242 !important;
    }

    /* BankForm Override */
    .net-nanopay-cico-ui-bankAccount-form-BankForm  {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
      background-color: #f9fbff !important;
    }

    .net-nanopay-cico-ui-bankAccount-form-BankForm input {
      background-color: white;
    }

    .net-nanopay-cico-ui-bankAccount-form-BankForm .title {
      margin-top: 16px !important;
    }

    /* Wizards */
    .net-nanopay-sme-onboarding-ui-BusinessRegistrationWizard {
      background-color: #f9fbff !important;
    }

    .net-nanopay-sme-ui-SendRequestMoney {
      background-color: #f9fbff !important;
    }

    .net-nanopay-ui-ActionView-save {
      color: #525455 !important;
      background: none !important;
      font-size: 16px !important;
      font-family: lato !important;
      height: 48px !important;
    }

    .net-nanopay-ui-ActionView-exit {
      color: #525455 !important;
      background: none !important;
      font-size: 16px !important;
      font-family: lato !important;
      height: 48px !important;
      border: none !important;
      box-shadow: none !important;
    }

    .net-nanopay-ui-ActionView-goNext {
      width: 158px !important;
      height: 48px !important;
      border-radius: 4px !important;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05) !important;
      background-color: #604aff !important;
      border: 1px solid #4a33f4 !important;
      font-size: 16px !important;
      font-weight: 400 !important;
      font-family: lato !important;
    }

    .net-nanopay-ui-ActionView-goBack,
    .net-nanopay-sme-ui-SendRequestMoney .net-nanopay-ui-ActionView-save {
      width: 158px !important;
      height: 48px !important;
      border-radius: 4px !important;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05) !important;
      background-color: #fff !important;
      border: 1px solid #604aff !important;
      font-size: 16px !important;
      font-weight: 400 !important;
      font-family: lato !important;
      color: #604aff !important;
    }

    .navigationContainer {
      padding: 12px 0 !important;
    }

    .navigationBar {
      height: 72px !important;
      box-shadow: 0 1px 1px 0 #dae1e9 !important;
      border-top: 1px solid #edf0f5 !important;
    }

    .net-nanopay-ui-ActionView-unavailable {
      display: none !important;
    }

    .net-nanopay-sme-ui-banner-ComplianceBanner .foam-u2-stack-StackView {
      height: calc(100% - 36px);
    }

    .net-nanopay-sme-SMEController .foam-u2-md-OverlayDropdown {
      transform: translate(-100%, 16px);
    }
  `
});
