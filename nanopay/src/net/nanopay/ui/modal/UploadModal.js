
foam.CLASS({
  package: 'net.nanopay.ui.modal',
  name: 'UploadModal',
  extends: 'foam.u2.View',

  documentation: 'Upload Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader',
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File',
    'foam.u2.dialog.NotificationMessage'
  ],
  imports: [
    'user',
    'blobService'
  ],

  exports: [
    'as data',
    'onInvoiceFileRemoved'
  ],
  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],
 
  css:`
    ^ .container{
      height: 600px;
      background-color: #093649;
      margin-bottom: 20px;
    }
    ^ .attachment-input {
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      position: absolute;
      z-index: -1;
    }
    ^ .box-for-drag-drop {
      margin: 20px;
      border: dashed 4px #edf0f5;
      height: 300px;
      width: 560px;
      overflow: scroll;
    }

    ^ .dragText{
      text-align: center;
      padding: 120px 190px  0px 191px;
    }
    ^ .inputImage{
      height: 60px;
      opacity: 1;
      margin-bottom: 10px;
      margin-top: -60px;
    }
    ^ .inputText{
      width: 177px;
      height: 40px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.43;
      letter-spacing: 0.2px;
      text-align: center;
      color: #093649;
    }
    ^ .inputRestrictText{
      width: 480px;
      height: 16px;
      opacity: 0.7;
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-left: -140px;
    }
    ^ .buttonBox{
      width: 100%;
      height: 8%;
    }
    ^ .net-nanopay-ui-modal-ModalHeader {
      width: 100%;
    } 
    ^ .net-nanopay-ui-ActionView-submitButton {
      font-family: Roboto;
      width: 136px;
      height: 40px;
      border-radius: 2px;
      background: %SECONDARYCOLOR%;
      border: solid 1px %SECONDARYCOLOR%;
      display: inline-block;
      color: white;
      text-align: center;
      cursor: pointer;
      font-size: 14px;
      padding: 0;
      margin: 5px 20px 10px 0px;;
      outline: none;
      float: right;
      box-shadow: none;
      font-weight: normal;
    }
    ^ .net-nanopay-ui-ActionView-cancelButton {
      font-family: Roboto;
      width: 136px;
      height: 40px;
      border-radius: 2px;
      background: rgba(164, 179, 184, 0.1);
      border: solid 1px #8C92AC;
      display: inline-block;
      color: #093649;
      text-align: center;
      cursor: pointer;
      font-size: 14px;
      padding: 0;
      margin: 5px 0px 10px 20px;;
      outline: none;
      float: left;
      box-shadow: none;
      font-weight: normal;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'inDropZone'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'data',
      value: this.exportData
    },
    'exportData'
  ],

  messages:[
    { name: 'BoxText', message: 'Choose files to upload or Drag and Drop them here' },
    { name: 'FileRestrictText', message: '*jpg, jpeg, png, pdf, doc, docx, ppt, pptx, pps, ppsx, odt, xls, xlsx only, 10MB maximum' },
    { name: 'FileTypeError', message: 'Wrong file format' },
    { name: 'FileSizeError', message: 'File size exceeds 10MB' }
  ],
  methods: [
    function initE(){
      this.SUPER();
      var self = this;
          
      this
      .on('dragover', this.onDragOver)
      .on('drop', this.onDropOut)
      .tag(this.ModalHeader.create({
        title: 'Choose File'
      }))
      .addClass(this.myClass())
      .start()
       .start('div').addClass('box-for-drag-drop')
          .add(this.slot(function (data) {
            var e = this.E();
            for ( var i = 0 ; i < data.length ; i++ ) {
              e.tag({
                class: 'net.nanopay.invoice.ui.InvoiceFileView',
                data: data[i],
                fileNumber: i + 1,
              });
            }
            return e;
          }, this.data$))
          .start('div').addClass('dragText').show(this.data$.map(function (data) {
            return data.length === 0;
          }))
            .start({ class: 'foam.u2.tag.Image', data: 'images/ic-created.svg' }).addClass('inputImage').end()
            .start('p').add(this.BoxText).addClass('inputText').end()
            .start('p').add(this.FileRestrictText).addClass('inputRestrictText').end()
          .end()
          .on('drop', this.onDrop)
          .on('click', self.onAddAttachmentClicked)
          .start('input').addClass('attachment-input')
            .attrs({
              type: 'file',
              accept: 'application/pdf',
              multiple: 'multiple'
            })
            .on('change', this.onChange)
          .end()
        .end()
        .start('div').addClass('buttonBox')
          .add(this.CANCEL_BUTTON)
          .add(this.SUBMIT_BUTTON)
        .end()
      .end()
      
    } ,
    function onInvoiceFileRemoved (fileNumber) {
      this.document.querySelector('.attachment-input').value = null;
      this.data.splice(fileNumber - 1, 1);
      this.data = Array.from(this.data);
    }
  ],
  actions:[
    {
      name: 'cancelButton',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'submitButton',
      label: 'Submit',
      code: function(X) {
        X.closeDialog();
        this.exportData = this.data;
      }
    },
  ],
  listeners: [
    function onAddAttachmentClicked (e) {
      this.document.querySelector('.attachment-input').click();
    },
    function onDragOver(e) {
      e.preventDefault();    
    },
    function onDropOut(e) {
      e.preventDefault();  
    },
    function onDrop(e) {
      e.preventDefault();  
      var files = []; 
      var inputFile;
      if ( e.dataTransfer.items ) {
        inputFile = e.dataTransfer.items
        if ( inputFile ) {
          for ( var i = 0; i < inputFile.length; i++ ) {
            // If dropped items aren't files, reject them
            if ( inputFile[i].kind === 'file' ) {
              var file = inputFile[i].getAsFile();
              if( this.isImageType(file) ) files.push(file);           
              else
                this.add(this.NotificationMessage.create({ message: this.FileTypeError, type: 'error' }));
            }
          }
        }
      } else if( e.dataTransfer.files ) {
        inputFile = e.dataTransfer.files
        for (var i = 0; i < inputFile.length; i++) {
          var file = inputFile[i];
          if( this.isImageType(file) ) files.push(file);            
          else{
            this.add(this.NotificationMessage.create({ message: this.FileTypeError, type: 'error' }));
          }  
        }
      }
      this.addFiles(files) 
    },
    function isImageType(file) {
      if( file.type === "image/jpg" || 
          file.type === "image/jpeg" || 
          file.type === "image/png" || 
          file.type === "application/msword" || 
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
          file.type === "application/vnd.ms-powerpoint" || 
          file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" || 
          file.type === "application/vnd.openxmlformats-officedocument.presentationml.slideshow" || 
          file.type === "application/vnd.oasis.opendocument.text" || 
          file.type === "application/vnd.ms-excel" || 
          file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
          file.type === "application/pdf") return true; 
      return false;
    },
    function onChange (e) {   
      var files = e.target.files;
      this.addFiles(files)
    },
    function addFiles(files){
      var errors = false;
      for ( var i = 0 ; i < files.length ; i++ ) {
        // skip files that exceed limit
        if ( files[i].size > ( 10 * 1024 * 1024 ) ) {
          if ( ! errors ) errors = true;
          this.add(this.NotificationMessage.create({ message: this.FileSizeError, type: 'error' }));
          continue;
        }
        var isIncluded = false
        for ( var j = 0 ; j < this.data.length ; j++ ) {
          if( this.data[j].filename.localeCompare(files[i].name) === 0 ) { 
            isIncluded = true; 
            break
          }
        }
        if ( isIncluded ) continue ;
        this.data.push(this.File.create({
          owner: this.user.id,
          filename: files[i].name,
          filesize: files[i].size,
          mimeType: files[i].type,
          data: this.BlobBlob.create({
            blob: files[i]
          })
        }))
      }
      this.data = Array.from(this.data);
    }
  ]
});