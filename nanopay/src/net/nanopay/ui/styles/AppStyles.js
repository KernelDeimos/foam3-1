
foam.CLASS({
  package: 'net.nanopay.ui.style',
  name: 'AppStyles',
  extends: 'foam.u2.View',

  documentation: 'Generic CSS that is used through out the Nanopay platform. Please Reference when styling views. Implements to class use.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*

        body {
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          letter-spacing: 0.2px;
          color: #373a3c;
          background: #edf0f5;
          margin: 0;
        }
        table {
          border-collapse: collapse;
          margin: auto;
          width: 962px;
        }
        thead > tr > th {
          font-family: 'Roboto';
          font-size: 14px;
          background-color: rgba(110, 174, 195, 0.2);
          color: #093649;
          line-height: 1.14;
          letter-spacing: 0.3px;
          border-spacing: 0;
          text-align: left;
          padding-left: 15px;
          height: 40px;
        }
        tbody > tr > th > td {
          font-size: 12px;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
          padding-left: 15px;
          height: 60px;
        }
        .foam-u2-DetailView {
          background: #fafafa;
          border: 1px solid grey;
        }
        .foam-u2-DetailView .foam-u2-DetailView {
          width: auto;
          margin: inherit;
      }
        .foam-u2-DetailView-title {
          background: #ddd;
          color: gray;
          padding: 6px;
        }
        .foam-u2-view-TableView th {
          font-family: 'Roboto';
          padding-left: 15px;
          font-size: 14px;
          line-height: 1;
          letter-spacing: 0.4px;
          color: #093649;
        }
        .foam-u2-view-TableView td {
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          padding-left: 15px;
          font-size: 12px;
          color: #093649;
        }
        .foam-u2-view-TableView tbody > tr {
          height: 60px;
          background: white;
        }
        .foam-u2-view-TableView tbody > tr:nth-child(odd) {
          background: #f6f9f9;
        }
        .net-nanopay-ui-ActionView{
          border: none;
          outline: none;
        }
        .net-nanopay-ui-ActionView-create {
          background: #59aadd;
          border: none;
          box-shadow: none;
          color: white;
          font-weight: 100;
          width: 135px;
          height: 39px;
        }
        .net-nanopay-ui-ActionView-back {
          position: absolute;
          top: 110px;
          width: 135px;
          height: 40px;
          border-radius: 2px;
          background-color: rgba(164, 179, 184, 0.1);
          box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
          color: black;
        }
        .foam-u2-view-ReciprocalSearch-filter {
          margin-bottom: 8px;
        }
        .foam-u2-search-TextSearchView input {
          width: 340px;
          font-size: 10pt;
          padding: 3px;
        }
        .foam-u2-search-GroupBySearchView select {
          font-family: monospace;
          font-size: 10pt;
          width: 340px;
        }
        .net-nanopay-ui-ActionView {
          padding: 4px 16px;
          text-decoration: none;
        }
        .net-nanopay-ui-ActionView-deleteDraft {
          background-color: rgba(164, 179, 184, 0.1);
          border: solid 1px #8C92AC;
          color: #093649;
          font-size: 14px;
        }
        .net-nanopay-ui-ActionView-saveAndPreview {
          background-color: #59AADD;
          color: white;
          font-size: 14px;
          float: right;
          border: 1px solid #59AADD;
        }
        .net-nanopay-ui-ActionView-saveAsDraft {
          background-color: #EDF0F5;
          border: solid 1px #59A5D5;
          color: #59A5D5;
          margin-right: 15px;
          float: right;
        }
        .row {
          display: inline-block;
          width: 100%;
        }
        .rowTopMarginOverride {
          margin-top: 0;
        }
        .spacer {
          display: inline-block;
        }
        .spacer:first-child {
          margin-left: 0;
        }
        .input-box{
          width: 90%;
          height: 60px;
          margin-left: 5%;
          font-size: 12px;
          font-weight: 300;
          color: #093649;
          text-align: left;
          border: 1px solid lightgrey;
        }
         .half-input-box {
           width: 50%;
           height: 60px;
           border: solid 1px rgba(164, 179, 184, 0.5);
           padding-left: 5px;
           padding-right: 5px;
           display: block;
           margin-top: 8px;
           outline: none;
         }
         .half-small-input-box {
           width: 50%;
           height: 40px;
           border: solid 1px rgba(164, 179, 184, 0.5);
           padding-left: 5px;
           padding-right: 5px;
           display: block;
           margin-top: 8px;
           outline: none;
         }
        .small-input-box{
          font-size: 12px;
          padding: 0px 5px;
          width: 215px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          outline: none;
        }
        .btn{
          width: 135px;
          height: 40px;
          border-radius: 2px;
          cursor: pointer;
          text-align: center;
          font-size: 14px;
          line-height: 2.86;
        }
        .blue-button{
          background-color: #59aadd;
          color: #ffffff;
          margin: 20px 20px;
          float: right;
        }
        .grey-button{
          background-color: rgba(164, 179, 184, 0.1);
          border: solid 1px #8C92AC;
          color: #093649;
        }
        .white-blue-button{
          border: solid 1px #59A5D5;
          color: #59A5D5;
          background: none;
        }
        .full-width-button{
          width: 90%;
          height: 40px;
          border-radius: 2px;
          border: solid 1px #59a5d5;
          margin: 0 auto;
          background-color: #59aadd;
          text-align: center;
          line-height: 40px;
          cursor: pointer;
          color: #ffffff;
          margin-top: 10px;
        }
        .full-width-input{
          width: 90%;
          height: 40px;
          margin-left: 5%;
          margin-bottom: 15px;
          outline: none;
          padding: 10px;
        }
        .label{
          height: 16px;
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          text-align: left;
          color: #093649;
          margin-bottom: 8px;
          margin-left: 25px;
        }
        .link{
          color: #59a5d5;
          cursor: pointer;
        }
        .light-roboto-h2 {
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          color: #093649;
          opacity: 0.6;
          margin-bottom: 35px;
          display: inline-block;
          white-space: nowrap;
        }
        .green-border-container{
          display: inline-block;
          border-radius: 4px;
          border: solid 1px #1cc2b7;
        }
         .button-row {
           width: 1004px;
           margin-bottom: 30px;
         }
         .white-container {
           width: 964px;
           background: white;
           padding: 20px;
         }
        .inline{
          display: inline-block;
        }
        .hide{
          display: none;
        }
        .float-left{
          float: left;
        }
        .float-right{
          float: right;
        }
        .thin-align{
          font-weight: 100;
          margin: 10px 0 0 0;
        }
        .blue-card-title{
          display: block;
          width: 135px;
          height: 70px;
          padding-top: 30px;
          border-radius: 2px;
          background-color: #59aadd;
          text-align: center;
          color: white;
          font-weight: 16px;
          display: inline-block;
        }
        .arrow-down {
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid lightgrey;
        }
        .error-label{
          float: right;
          font-size: 8px;
          color: red;
        }
        .property-amount {
          width: 408px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          outline: none;
          margin-left: 20px;
          border-radius: 5px;
          padding: 10px;
        }
        .foam-u2-view-TableView-noselect {
          width: 1px;
          cursor: pointer;
          text-align: right !important;
        }
        .foam-u2-dialog-Popup.popup-with-topnav {
          margin-top: 65px;
          z-index: 10000;
        }
        .close-x {
          position: absolute;
          width: 32px;
          height: 32px;
          opacity: 0.3;
        }
        .close-x:hover {
          opacity: 1;
        }
        .close-x:before, .close-x:after {
          position: absolute;
          content: ' ';
          height: 20px;
          width: 2px;
          background-color: #333;
        }
        .close-x:before {
          transform: rotate(45deg);
        }
        .close-x:after {
          transform: rotate(-45deg);
        }
        .stepTopMargin {
          margin-top: 0;
        }
      */}
    })
  ]
});
