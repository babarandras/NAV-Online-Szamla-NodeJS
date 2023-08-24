
/** 
 * A REST API-n keresztül történő adatszolgáltatáshoz szükséges echnikai felhasználó adatai, melyet az elsődleges felhasználó hozhat létre a rendszerben
 */
export class UserHeaderType {
  // A technikai felhasználó login neve
  login: string;
  // A technikai felhasználó jelszóhash értéke
  passwordHash: string;
  // Azon adózó adószámának első 8 jegye,aki az interfész szolgáltatását igénybeveszi, és akihez a technikai felhasználótartozik  
  taxNumber: string;
  // A kérés aláírásának hash értéke
  requestSignature: string;

  constructor() {
    this.login = '';
    this.passwordHash = '';
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
  serviceName: string;
  requestID: string;
  date: Date;
  user: UserHeaderType;  
  software: SoftwareType;
  invoices: any;

  constructor() {
    this.serviceName = '';
    this.requestID = '';
    this.date = new Date();
    this.user = new UserHeaderType();
    this.software = new SoftwareType();
    this.invoices = [];
  }
}