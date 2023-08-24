import { TechnicalUser, SoftwareData } from "./classses";
import axios from "axios";
import crypto from "crypto";

export function createPasswordHash(password: string) {
  const hash = crypto
    .createHash("sha512")
    .update(password)
    .digest("hex")
    .toUpperCase();

  return hash;
}

export function createRequestID() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_+';
  const patternLength = 27;
  let requestID: string = "RID";

  for (let i = 0; i < patternLength; i++) {
    const index = crypto.randomInt(0, characters.length);
    requestID += characters[index];
  }

  return requestID;
}

export function createRequestSignature(requestID: string, date: Date, signatureKey: string, invoices: any = []) {
  const timeStamp = date.toISOString().split('.')[0].replace(/[-:T]/g, '');;
  const incoicesCrcChecksum = invoices.map(((invoice: any) => {
    const hash = crypto
      .createHash('sh3-512')
      .update(`${invoice.operation}${invoice.data}`)
      .digest('hex')
      .toUpperCase();
    return hash;

  })
}

export function createBaseRequest(serviceName: string, requestID: string, date: Date, technicalUser: TechnicalUser, softwareData: SoftwareData, invoices: any = []) {

}
