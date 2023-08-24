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
  // A kérés aláírásának hash értéke
  public requestSignature: string;

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
    this.requestSignature = '';
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
  public serviceName: string;
  public requestID: string;
  public date: Date;
  public user: UserHeaderType;
  public software: SoftwareType;
  public invoices: any;

  constructor() {
    this.serviceName = '';
    this.requestID = '';
    this.date = new Date();
    this.user = new UserHeaderType();
    this.software = new SoftwareType();
    this.invoices = [];
  }
}

export class RequestBuilder {
  private requestParams: RequestParams;

  private _request: Object;
  public get request(): Object {
    this._request = {
      [this.requestParams.serviceName]: {
        $: {
          'xmlns': 'http://schemas.nav.gov.hu/OSA/3.0/api',
          'xmlns:common': 'http://schemas.nav.gov.hu/NTCA/1.0/common'
        },
        'common:header': {
          'common:requestId': this.requestParams.requestID,
          'common:timestamp': this.requestParams.date.toISOString(),
          'common:requestVersion': '3.0',
          'common:headerVersion': '1.0',
        },
        'common:user': {
          'common:login': this.requestParams.user.login,
          'common:passwordHash': {
            $: {
              cryptoType: 'SHA-512',
            },
            _: this.requestParams.user.passwordHash,
          },
          'common:taxNumber': this.requestParams.user.taxNumber,
          'common:requestSignature': {
            $: {
              cryptoType: 'SHA3-512',
            },
            _: this.requestParams.user.requestSignature,
          },
        },
        'software': {
          'softwareId': this.requestParams.software.softwareId,
          'softwareName': this.requestParams.software.softwareName,
          'softwareOperation': this.requestParams.software.softwareOperation,
          'softwareMainVersion': this.requestParams.software.softwareMainVersion,
          'softwareDevName': this.requestParams.software.softwareDevName,
          'softwareDevContact': this.requestParams.software.softwareDevContact,
          'softwareDevCountryCode': this.requestParams.software.softwareDevCountryCode,
          'softwareDevTaxNumber': this.requestParams.software.softwareDevTaxNumber
        },
      },
    };
    return this._request;
  }

  private _requestXML: any;
  public get requestXML(): any {
    
    const builder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8', standalone: true },
      renderOpts: { pretty: true, indent: '\t', newline: '\n' },
    });

    




    this._requestXML = '';
    return this._requestXML;
  }

  constructor(requestParams: RequestParams) {
    this.requestParams = requestParams;
  }

}