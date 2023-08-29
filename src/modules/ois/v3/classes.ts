import crypto from "crypto";
import xml2js from "xml2js";
/** 
 * A REST API-n keresztül történő adatszolgáltatáshoz szükséges echnikai felhasználó adatai, melyet az elsődleges felhasználó hozhat létre a rendszerben
 */
export class UserHeaderType {
  // A technikai felhasználó login neve
  public login: string;
  // A technikai felhasználó jelszava
  private _password: string;
  // A technikai felhasználó jelszó hash értéke
  private _passwordHash: string;
  // Azon adózó adószámának első 8 jegye,aki az interfész szolgáltatását igénybeveszi, és akihez a technikai felhasználótartozik  
  public taxNumber: string;

  // jelszó megadása esetén kiszámítluk a hash értékét
  public set password(value: string) {
    this._password = value;
    this._passwordHash = crypto
      .createHash("sha512")
      .update(value)
      .digest("hex")
      .toUpperCase();
  }

  // visszaadja a _passwordHash értékét
  public get passwordHash(): string {
    return this._passwordHash;
  }

  constructor() {
    this.login = '';
    this.password = '';
    this.taxNumber = '';
  }
}

/**
 * A számlázóprogram adatai az Online Számla 3.0 rendszer interfész specifikációban meghatározott SoftwareType XML element alapján
 */
export class SoftwareType {
  // A számlázó program azonosítója
  softwareId: string;
  // A számlázó program neve
  softwareName: string;
  // A számlázó program működési típusa
  softwareOperation: string;
  // A számlázó program fő verziója
  softwareMainVersion: string;
  // A számlázó program fejlesztőjének neve
  softwareDevName: string;
  // A számlázó program fejlesztőjének működő email címe
  softwareDevContact: string;
  // A számlázó program fejlesztőjének országkódja
  softwareDevCountryCode: string;
  // A számlázó program fejlesztőjének adószáma
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

export class RequestParams {
  public baseURL: string;
  public signatureKey: string;
  public exchangeKey: string;
  public requestID: string;
  public date: Date;
  public user: UserHeaderType;
  public software: SoftwareType;
  public invoices: any;

  constructor() {
    this.baseURL = '';
    this.signatureKey = '';
    this.exchangeKey = '';
    this.requestID = '';
    this.date = new Date();
    this.user = new UserHeaderType();
    this.software = new SoftwareType();
    this.invoices = [];
  }
}

export class QueryInvoiceDigestRequestParams {
  public page: number;
  public invoiceDirection: string;
  public invoiceQueryParams = class {
    mandatoryQueryParams = class {
      invoiceIssueDate = class {
        dateFrom: string;
        dateTo: string;
      };
    }
  }

  constructor() {
    this.page = 1;
    this.invoiceDirection = 'INBOUND';

    let invoiceQueryParams = new this.invoiceQueryParams;
    let mandatoryQueryParams = new invoiceQueryParams.mandatoryQueryParams;
    let invoiceIssueDate = new mandatoryQueryParams.invoiceIssueDate;   
    invoiceIssueDate.dateFrom = '';
    invoiceIssueDate.dateTo = '';
  }

}

