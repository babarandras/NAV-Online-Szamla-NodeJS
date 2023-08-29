import { RequestParams } from "./classes";
import axios from "axios";
import crypto from "crypto";
import xml2js from 'xml2js';
import { promisify } from 'util';
import pkg from 'lodash';

const { pick } = pkg;
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
  let requestID: string = 'RID';

  for (let i = 0; i < patternLength; i++) {
    const index = crypto.randomInt(0, characters.length);
    requestID += characters[index];
  }

  return requestID;
}

/**
 * Interface kérés aláírása a megadott paraméterek alapján
 * 
 * @returns 
 */
export function requestSignature(requestParams: RequestParams): string {
  const timestamp = `${requestParams.date.toISOString().split('.')[0]}`.replace(/[-:T]/g, '');  
  const invoicesChecksum = requestParams.invoices
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
    .createHash('sha3-512')
    .update(`${requestParams.requestID}${timestamp}${requestParams.signatureKey}${invoicesChecksum}`)   
    .digest('hex')
    .toUpperCase();

  return signature;
}

export function requestSignature1(requestID: string, date: string, signatureKey: string, invoices: any = []): string { 

  const hash = crypto.createHash('sha3-512');
  hash.update(`${requestID}${date}${signatureKey}`);
  const val = hash.digest('hex').toUpperCase();  
  return val;
    
}

export class RequestBuilder {

  private serviceName: string;
  private requestParams: RequestParams;
  private requestSign: string;

  constructor(serviceName: string, requestParams: RequestParams) {
    this.serviceName = serviceName;
    this.requestParams = requestParams;
    this.requestSign = requestSignature(requestParams);
  }

  private _request: any;
  public set request(theRequest: any) {
    this._request = theRequest;
  };
  public get request(): any {
    this._request = {
      [this.serviceName]: {
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
            _: this.requestSign,
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

    const xml = builder.buildObject(this._request);

    this._requestXML = `${xml}\n`;

    return this._requestXML;
  }
}

export async function sendRequest(baseURL: string, endPoint: string, requestXML: any) {

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
