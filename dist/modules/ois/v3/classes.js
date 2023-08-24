"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRequestParams = exports.SoftwareData = exports.TechnicalUser = void 0;
class TechnicalUser {
    constructor() {
        this.login = "";
        this.password = "";
        this.taxNumber = "";
        this.signatureKey = "";
        this.exchangeKey = "";
    }
}
exports.TechnicalUser = TechnicalUser;
class SoftwareData {
    constructor() {
        this.softwareId = "";
        this.softwareName = "";
        this.softwareOperation = "";
        this.softwareMainVersion = "";
        this.softwareDevName = "";
        this.softwareDevContact = "";
        this.softwareDevCountryCode = "";
        this.softwareDevTaxNumber = "";
    }
}
exports.SoftwareData = SoftwareData;
class BaseRequestParams {
    constructor() {
        this.serviceName = '';
        this.requestID = '';
        this.date = new Date();
        this.technicalUser = new TechnicalUser();
        this.softwareData = new SoftwareData();
        this.invoices = [];
    }
}
exports.BaseRequestParams = BaseRequestParams;
//# sourceMappingURL=classes.js.map