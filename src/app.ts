import { QueryInvoiceDigestRequestParams, RequestParams } from "./modules/ois/v3/classes";
import { newRequestID, requestSignature1 } from "./modules/ois/v3/request-utils";
import { NAVRestclient } from "./modules/ois/v3/nav-restclient";

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

  requestParams.requestID = newRequestID();
  requestParams.date = new Date();

  let client = new NAVRestclient(requestParams);
  /*client.queryTaxpayer('11043924').then((response) => {
    console.log(response);
  }); */

  let params = new QueryInvoiceDigestRequestParams();
  let invoiceQueryParams = new params.invoiceQueryParams;
  let mandatoryQueryParams = new invoiceQueryParams.mandatoryQueryParams;
  let invoiceIssueDate = new mandatoryQueryParams.invoiceIssueDate;
  invoiceIssueDate.dateFrom = '2023-08-29';
  invoiceIssueDate.dateTo = '2023-08-29';

  client.queryInvoiceDigest(params).then((response) => {
    console.log(response);
  });
}

test();