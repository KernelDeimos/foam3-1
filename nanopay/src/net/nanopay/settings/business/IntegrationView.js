foam.CLASS({
    package: 'net.nanopay.settings.business',
    name: 'IntegrationView',
    extends: 'foam.u2.View',
  
    imports: [ 'stack' ],
  
    documentation: 'Accounting Integration Management',
  
    axioms: [
      foam.u2.CSS.create({
        code: function CSS() {/*
          ^{
            width: 100%;
            background-color: #edf0f5;
            margin: auto;
          }
          ^ .businessSettingsContainer {
            width: 992px;
            margin: auto;
          } 
          
          ^ .boxContainer {
            width: 992px;
            min-height: 80px;
            border-radius: 2px;
            background-color: white;

            padding: 20px;
            box-sizing: border-box;
          }

          ^ .boxTitle {
            opacity: 0.6;
            font-family: 'Roboto';
            font-size: 20px;
            font-weight: 300;
            line-height: 20px;
            letter-spacing: 0.3px;
            text-align: left;
            color: #093649;
            display: inline-block;
            
          }
          
          ^ .close-BTN {
            width: 135px;
            height: 40px;
            border-radius: 2px;
            background-color: rgba(164, 179, 184, 0.1);
            box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
            font-family: 2px;
            font-size: 14px;
            line-height: 2.86;
            letter-spacing: 0.2px;
            text-align: center;
            color: #093649;
            cursor: pointer;
            display: inline-block;
            float: right;
          }

          ^ .labelContent {
            font-family: Roboto;
            font-size: 14px;
            font-weight: 300;
            letter-spacing: 0.2px;
            color: #093649;
            margin-top: 20px;
        }

        ^ .integrationImgDiv{
           width: 223px;
	       height: 120px;
           border: solid 1px #dce0e7;  

           display: inline-block;
           margin: 25px 20px 30px 0px;

           position: relative;
           box-sizing: border-box;
        }

        ^ .integrationImg{
            display: block;
            position: absolute;  
            top: 0;  
            bottom: 0;  
            left: 0;  
            right: 0;  
            margin: auto;
        }

        ^ .last-integrationImgDiv{
            margin-right: 0;
        }

        ^ .centerDiv{
            margin: auto;
            text-align: center;
        }

        ^ .intergration-Input{
            width: 225px;
            height: 30px;
            border: solid 1px rgba(164, 179, 184, 0.5);

            display: inline-block;
            margin-right: 20px;

        }

        ^ .submit-BTN{
            width: 110px;
            height: 30px;
            border-radius: 2px;
            border: solid 1px #59a5d5;
            box-sizing: border-box;

            font-size: 14px;
            line-height: 2.14;
            letter-spacing: 0.2px;
            text-align: center;
            color: #59a5d5;

            display: inline-block;
            cursor: pointer;

        }

        ^ .submit-BTN:hover{
            background-color: #59a5d5;
            color: white;
        }

        ^ .inputLine{
            margin-top: 20px;
        }


         
        */}
      })
    ],

    
  
    methods: [
      function initE() {
        this.SUPER();
        this
          .addClass(this.myClass())
          .start('div').addClass('businessSettingsContainer')
            
           
            .start('div').addClass('boxContainer')
              .start().add('Integration Management').addClass('boxTitle').end()
              .start().addClass('close-BTN').add("Close").end()

              .start().addClass('labelContent').add("Connct to your accounting software and make your payment process seamlessly.").end()
              .start().addClass('integrationImgDiv')
                    .start({class:'foam.u2.tag.Image', data:'images/setting/integration/xero.png'}).addClass('integrationImg')
                    .attrs({
                        srcset: 'images/setting/integration/xero@2x.png 2x, images/setting/integration/xero@3x.png 3x'
                      })
                      .end()
              .end()

              .start().addClass('integrationImgDiv')
                    .start({class:'foam.u2.tag.Image', data:'images/setting/integration/qb.png'}).addClass('integrationImg')
                    .attrs({
                        srcset: 'images/setting/integration/qb@2x.png 2x, images/setting/integration/qb@3x.png 3x'
                        })
                    .end()
             .end()

             .start().addClass('integrationImgDiv')
                    .start({class:'foam.u2.tag.Image', data:'images/setting/integration/fresh.png'}).addClass('integrationImg')
                    .attrs({
                        srcset: 'images/setting/integration/fresh@2x.png 2x, images/setting/integration/fresh@3x.png 3x'
                        })
                    .end()
             .end()

             .start().addClass('integrationImgDiv last-integrationImgDiv')
             .start({class:'foam.u2.tag.Image', data:'images/setting/integration/intacct.png'}).addClass('integrationImg')
                    .attrs({
                        srcset: 'images/setting/integration/intacct@2x.png 2x, images/setting/integration/intacct@3x.png 3x'
                        })
                    .end()
            .end()

            .start().addClass('labelContent centerDiv').add("Can’t find your software? Tell us about it.").end()
            .start().addClass('centerDiv inputLine')
                .start('input').addClass('intergration-Input').end()
                .start().add("submit").addClass('submit-BTN').end()
            .end()

              
        .end()


     .end()
      }
    ]
  });
  