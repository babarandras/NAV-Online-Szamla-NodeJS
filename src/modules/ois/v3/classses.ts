export class TechnicalUser {
  login: string;
  password: string;
  taxNumber: string;
  signatureKey: string;
  exchangeKey: string;

  constructor() {
    this.login = "";
    this.password = "";
    this.taxNumber = "";
    this.signatureKey = "";
    this.exchangeKey = "";
  }
}

export class SoftwareData {
  softwareId: string;
  softwareName: string;
  softwareOperation: string;
  softwareMainVersion: string;
  softwareDevName: string;
  softwareDevContact: string;
  softwareDevCountryCode: string;
  softwareDevTaxNumber: string;

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

export class RequestParams{
  serviceName: string;
  requestID: string;
  date: Date;
  technicalUser: TechnicalUser;
  softwareData: SoftwareData;

  constructor(){
    this.serviceName = '';
    this.requestID = '';
    this.date = new Date();
    this.technicalUser = new TechnicalUser();
    this.softwareData = new SoftwareData();
  }
}
