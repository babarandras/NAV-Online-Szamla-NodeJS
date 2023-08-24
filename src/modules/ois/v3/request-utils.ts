import { TechnicalUser, SoftwareData, BaseRequestParams } from "./classes";
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

/**
 * 
 * @param requestParams kérés paraméter a BaseRequestParams alapján
 */
export function baseRequest(requestParams: BaseRequestParams) {

}
