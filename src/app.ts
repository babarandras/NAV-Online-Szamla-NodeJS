import { RequestParams, RequestBuilder } from "./modules/ois/v3/classes";
import { requestSignature, newRequestID, sendRequest } from "./modules/ois/v3/request-utils";

import { OIS3_Config } from "./config";

import express from 'express';
import path = require('path');

/*const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});*/


function test() {
  let requestParams = new RequestParams();
  requestParams.baseURL = 'https://api.onlineszamla.nav.gov.hu/invoiceService/v3';
  requestParams.signatureKey = OIS3_Config.signatureKey;
  requestParams.exchangeKey = OIS3_Config.exchangeKey;
  requestParams.invoices = [];

  requestParams.user.login = OIS3_Config.user.login;
  requestParams.user.password = OIS3_Config.user.password;
  requestParams.user.taxNumber = OIS3_Config.user.taxNumber;

  requestParams.software.softwareId = OIS3_Config.software.softwareId;
  requestParams.software.softwareName = OIS3_Config.software.softwareName;
  requestParams.software.softwareOperation = OIS3_Config.software.softwareOperation;
  requestParams.software.softwareMainVersion = OIS3_Config.software.softwareMainVersion;
  requestParams.software.softwareDevName = OIS3_Config.software.softwareDevName;
  requestParams.software.softwareDevContact = OIS3_Config.software.softwareDevContact;
  requestParams.software.softwareDevCountryCode = OIS3_Config.software.softwareDevCountryCode;
  requestParams.software.softwareDevTaxNumber = OIS3_Config.software.softwareDevTaxNumber;

  const requestID = newRequestID();
  const date = new Date();
  requestParams.user.requestSignature = requestSignature(requestID, date, requestParams.signatureKey);

  requestParams.serviceName = 'TokenExchangeRequest';
  const builder = new RequestBuilder(requestParams);
  const xml = builder.requestXML;

  //const response = sendRequest(requestParams);
  
  //console.log(response);

  requestParams.endPoint = 'tokenExchange';
  sendRequest(requestParams).then(function (result) {
    if (result) {
        console.log(result)
    }
})


}

test();