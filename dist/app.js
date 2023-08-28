"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const classes_1 = require("./modules/ois/v3/classes");
const request_utils_1 = require("./modules/ois/v3/request-utils");
/*const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});*/
function test() {
    let requestParams = new classes_1.RequestParams();
    requestParams.baseURL = 'https://api.onlineszamla.nav.gov.hu/invoiceService/v3';
    requestParams.signatureKey = '50-b887-0d100069ec9227AAG2M4JBU6';
    requestParams.exchangeKey = '1fc527AAG2M5XHU7';
    requestParams.invoices = [];
    requestParams.user.login = 'igsba0zdqvykqxc';
    requestParams.user.password = 'NavXml001(!!!)';
    requestParams.user.taxNumber = '11043924';
    requestParams.software.softwareId = 'HUFAP1104392400001';
    requestParams.software.softwareName = 'NAV Online Invoice Tester';
    requestParams.software.softwareOperation = 'LOCAL_SOFTWARE';
    requestParams.software.softwareMainVersion = '1.0';
    requestParams.software.softwareDevName = 'Babar András';
    requestParams.software.softwareDevContact = 'navxml@mezohegyesbirtok.hu';
    requestParams.software.softwareDevCountryCode = 'HU';
    requestParams.software.softwareDevTaxNumber = '11043924';
    const requestID = (0, request_utils_1.newRequestID)();
    const date = new Date();
    requestParams.user.requestSignature = (0, request_utils_1.requestSignature)(requestID, date, requestParams.signatureKey);
    requestParams.serviceName = 'TokenExchangeRequest';
    const builder = new classes_1.RequestBuilder(requestParams);
    const xml = builder.requestXML;
    //const response = sendRequest(requestParams);
    //console.log(response);
    requestParams.endPoint = 'tokenExchange';
    (0, request_utils_1.sendRequest)(requestParams).then(function (result) {
        if (result) {
            console.log(result);
        }
    });
}
test();
//# sourceMappingURL=app.js.map