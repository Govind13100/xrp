var express = require('express');
var mysql = require("mysql");
var app = express();
var status_code = '';
var fromAddress = '';
var secret      = '';
var toAddress   = '';
var amount      = '';



const RippleAPI = require('ripple-lib').RippleAPI;
const api = new RippleAPI({
  server: 'wss://s.altnet.rippletest.net:51233' // Public rippled server hosted by Ripple, Inc.
});

api.on('error', (errorCode, errorMessage) => {
  console.log(errorCode + ': ' + errorMessage);
});
api.on('connected', () => {
  console.log('connected');
});
api.on('disconnected', (code) => {
  // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
  // will be 1000 if this was normal closure
  console.log('disconnected, code:', code);
});

app.get('/add', function (req, res) {
  
  status_code = req.query.status;
  fromAddress = req.query.fromAddress_url;
  secret = req.query.secret_url;
  toAddress = req.query.toAddress_url;
  amount = req.query.amount_url;
    


   if(status_code == "1"){
      getAddress(res);
      //console.log('res');
   }else if (status_code == '2'){

   

      doTransaction(res,fromAddress,secret,toAddress,amount);
   }

});


function getAddress(res){

  api.connect().then(() => {
    /* insert code here */
  var a = api.generateAddress();
  //console.log(a);
  //res.end(return_value);
  res.contentType('application/json');
  res.end(JSON.stringify(a));


  }).then(() => {
   return api.disconnect();



  }).catch(console.error);

}

function doTransaction(res,fromAddress,secret,toAddress,amount){

  api.connect().then(() => {
    /* insert code here */
  const address = fromAddress;
  const secrett = secret;


  const instructions = {maxLedgerVersionOffset: 2};

  const payment = {
    source: {
      address: address,
      maxAmount: {
        value: amount,
        currency: 'XRP'
      }
    },
    destination: {
      address: toAddress,
      amount: {
        value: amount,
        currency: 'XRP'
      }
    }
  };

  function quit(message) {
    console.log(message);
    process.exit(0);
  }

  function fail(message) {
    console.error(message);
    process.exit(1);
  }

  return api.preparePayment(address, payment, instructions).then(prepared => {
    //console.log('Payment transaction prepared...');
    //console.log(prepared.txJSON);
    const signedTransaction = api.sign(prepared.txJSON, secrett);
    //console.log('Payment transaction signed...');
    console.log(signedTransaction.signedTransaction);
    api.submit(signedTransaction.signedTransaction).then(quit, fail);
    res.contentType('application/json');
    res.end(JSON.stringify(signedTransaction));
  });

  }).then(() => {
   return api.disconnect();
  }).catch(console.error);

}


if (module === require.main) {
  // [START server]
  // Start the server
  var server = app.listen(process.env.PORT || 8085, function () {
    var port = server.address().port;
    console.log('App listening on port %s', port);
  });
  // [END server]
}

module.exports = app;