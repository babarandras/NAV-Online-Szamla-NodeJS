"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const classes_1 = require("./modules/ois/v3/classes");
const request_utils_1 = require("./modules/ois/v3/request-utils");
const config_1 = require("./config");
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
    requestParams.signatureKey = config_1.OIS3_Config.signatureKey;
    requestParams.exchangeKey = config_1.OIS3_Config.exchangeKey;
    requestParams.invoices = [];
    requestParams.user.login = config_1.OIS3_Config.user.login;
    requestParams.user.password = config_1.OIS3_Config.user.password;
    requestParams.user.taxNumber = config_1.OIS3_Config.user.taxNumber;
    requestParams.software.softwareId = config_1.OIS3_Config.software.softwareId;
    requestParams.software.softwareName = config_1.OIS3_Config.software.softwareName;
    requestParams.software.softwareOperation = config_1.OIS3_Config.software.softwareOperation;
    requestParams.software.softwareMainVersion = config_1.OIS3_Config.software.softwareMainVersion;
    requestParams.software.softwareDevName = config_1.OIS3_Config.software.softwareDevName;
    requestParams.software.softwareDevContact = config_1.OIS3_Config.software.softwareDevContact;
    requestParams.software.softwareDevCountryCode = config_1.OIS3_Config.software.softwareDevCountryCode;
    requestParams.software.softwareDevTaxNumber = config_1.OIS3_Config.software.softwareDevTaxNumber;
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