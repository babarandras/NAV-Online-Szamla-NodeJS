/** 
 * A REST API-n keresztül történő adatszolgáltatáshoz szükséges echnikai felhasználó adatai, melyet az elsődleges felhasználó hozhat létre a rendszerben
 */
export class TechnicalUser {
  login: string;
  password: string;
  taxNumber: string;
  signatureKey: string;
  exchangeKey: string;

  constructor() {
    this.login = '';
    this.password = '';
    this.taxNumber = '';
    this.signatureKey = '';
    this.exchangeKey = '';
  }
}

/**
 * A számlázóprogram adatai az Online Számla 3.0 rendszer interfész specifikációban meghatározott SoftwareType XML element alapján
 */
export class SoftwareType {
  softwareId: string;
  softwareName: string;
  softwareOperation: string;
  softwareMainVersion: string;
  softwareDevName: string;
  softwareDevContact: string;
  softwareDevCountryCode: string;
  softwareDevTaxNumber: string;

  constructor() {
    this.softwareId = '';
    this.softwareName = '';
    this.softwareOperation = '';
    this.softwareMainVersion = '';
    this.softwareDevName = '';
    this.softwareDevContact = '';
    this.softwareDevCountryCode = '';
    this.softwareDevTaxNumber = '';
  }
}

export class BaseRequestParams {
  serviceName: string;
  requestID: string;
  date: Date;
  technicalUser: TechnicalUser;
  softwareData: SoftwareType;
  invoices: any;

  constructor() {
    this.serviceName = '';
    this.requestID = '';
    this.date = new Date();
    this.technicalUser = new TechnicalUser();
    this.softwareData = new SoftwareType();
    this.invoices = [];
  }
}
