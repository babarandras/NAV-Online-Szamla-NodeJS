import { RequestParams, RequestBuilder } from "./classes";
import axios from "axios";
import crypto from "crypto";
import xml2js from 'xml2js';
import { promisify } from 'util';
import  pkg from 'lodash';

const {pick} = pkg;
const xmlParser = new xml2js.Parser({ explicitArray: false });
const parseXml = promisify(xmlParser.parseString).bind(xmlParser);


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
 * @param requestParams 
 */
export async function sendRequest(requestParams: RequestParams) {
  const { baseURL, endPoint } = requestParams;
  const builder = new RequestBuilder(requestParams);
  const requestXML = builder.requestXML;

  // egyedi axios példány létrehozása
  const navAxios = axios.create({
    baseURL: baseURL,
    timeout: 70000,
    headers: {
      'content-type': 'application/xml',
      accept: 'application/xml',
      encoding: 'UTF-8',
    },
  });

  // kérés elküldése, response adatok feldolgozása
  try {
    const response = await navAxios.post(endPoint, requestXML);
    const responseXML = response.data;
    // helyettesítsük az ns2 és ns3 válaszokat üres karakterláncra, mert névterekkel és névterek nélkül is kaphatunk válaszokat
    const noNsXml = response.data.replace(/ns2:|ns3:/g, '');
    response.data = await parseXml(noNsXml);

    return { ...response.data, responseXML };
  }
  // hiba feldolgozása
  catch (error) {
    const { response } = error;
    /* Normalize errors. */
    if (response) {
      /* istanbul ignore next */
      if (!response.data) {
        response.data = {
          result: {},
          technicalValidationMessages: [],
        };
      } else if (response.data.includes('GeneralExceptionResponse')) {
        // helyettesítsük az ns2 és ns3 válaszokat üres karakterláncra, mert névterekkel és névterek nélkül is kaphatunk válaszokat
        const noNsXml = response.data.replace(/ns2:|ns3:/g, '');

        const data = await parseXml(noNsXml);
        response.data = {
          result: pick(data.GeneralExceptionResponse, [
            'funcCode',
            'errorCode',
            'message',
          ]),
          technicalValidationMessages: [],
        };
      } else if (response.data.includes('GeneralErrorResponse')) {
        // helyettesítsük az ns2 és ns3 válaszokat üres karakterláncra, mert névterekkel és névterek nélkül is kaphatunk válaszokat
        const noNsXml = response.data.replace(/ns2:|ns3:/g, '');

        const data = await parseXml(noNsXml);
        response.data = pick(data.GeneralErrorResponse, [
          'result',
          'schemaValidationMessages',
          'technicalValidationMessages',
        ]);

        const { technicalValidationMessages } = response.data;

        // Normalizálja a technicalValidationMessages-t 
        if (!response.data.technicalValidationMessages) {
          response.data.technicalValidationMessages = [];
        } else if (!Array.isArray(technicalValidationMessages)) {
          response.data.technicalValidationMessages = [
            technicalValidationMessages,
          ];
        }
      } else {
        response.data = {
          result: {
            message: response.data,
          },
          technicalValidationMessages: [],
        };
      }
    }

    throw error;
  }



}
