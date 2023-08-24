import { RequestParams } from "./classes";
import axios from "axios";
import crypto from "crypto";

/**
 * jelszó Hash az Online Számla 3.0 rendszer interfész specifikáció alapján
 * @param password az Online Számla rendszerhez tartozó egyedi jelszó 
 * @returns a megadott jelszó hash-el értéke
 */
export function passwordHash(password: string) {
  const hash = crypto
    .createHash("sha512")
    .update(password)
    .digest("hex")
    .toUpperCase();

  return hash;
}

/**
 * Új request ID generálása az Online Számla 3.0 rendszer interfész specifikáció alapján. A request ID az 'RID' előtaggal fog kezdődni
 * @returns {string} RequestID értéke
 */
export function newRequestID(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_+';
  const patternLength = 27;
  let requestID: string = "RID";

  for (let i = 0; i < patternLength; i++) {
    const index = crypto.randomInt(0, characters.length);
    requestID += characters[index];
  }

  return requestID;
}

/**
 * Interface kérés aláírása a megadott paraméterek alapján
 * @param requestID Egyedi kérés azonosító, értékét a newRequestID() függvényel generálhatjuk
 * @param date A kérés időpontja, dátuma
 * @param signatureKey Aláírási kulcs
 * @param invoices Számla vagy számlák xml tartalma base64-ben
 * @returns 
 */
export function requestSignature(requestID: string, date: Date, signatureKey: string, invoices: any = []): string {
  const timestamp = date.toISOString().split('.')[0].replace(/[-:T]/g, '');;
  const invoicesChecksum = invoices
    .map((invoice: any) => {
      const hash = crypto
        .createHash('sha3-512')
        .update(`${invoice.operation}${invoice.data}`)
        .digest('hex')
        .toUpperCase();
      return hash;
    })
    .join('');

  const signature = crypto
    .createHash('sha-512')
    .update(`${requestID}${timestamp}${signatureKey}${invoicesChecksum}`)
    .digest('hex')
    .toUpperCase();

  return signature;
}

export class RequestBuilder {
  private requestParams: RequestParams;
  
  constructor(requestParams: RequestParams) {
    this.requestParams = requestParams;
  }

  getRequest() {    
    const request = {
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

    return request;
  }
}

/**
 * 
 * @param requestParams kérés paraméter a BaseRequestParams alapján
 */
export function baseRequest(requestParams: RequestParams) {

}
