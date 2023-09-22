/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import axios from 'axios';
import xml2js from 'xml2js';
import { promisify } from 'util';
import pkg from 'lodash';

import * as zlib from 'zlib';

import {
  QueryTaxpayerRequest,
  QueryTaxpayerRequestBuilder,
  QueryInvoiceDigestRequestParams,
  QueryInvoiceDigestRequestBuilder,
  QueryInvoiceDataRequestParams,
  QueryInvoiceDataRequestBuilder,
} from './ois-request-utils'

// ----------------------------------------------------------------

/**
 * 
 */
export class OnlineInvoiceRestClient {
  public baseURL = 'https://api.onlineszamla.nav.gov.hu/invoiceService/v3';
  public timeout = 70000;
  public signatureKey = '';

  // ----------------------------------------------------------------

  private async postRequest(endPoint: string, requestXML: string) {
    const xmlParser = new xml2js.Parser({ explicitArray: false });
    const parseXml = promisify(xmlParser.parseString).bind(xmlParser);
    const { pick } = pkg;

    // egyedi axios példány létrehozása...
    const navAxios = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
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
      throw response.data;
    }

  }

  // ----------------------------------------------------------------

  /**
   * A queryTaxpayer belföldi adószám validáló operáció, mely a számlakiállítás folyamatába építve képes a megadott adószám valódiságáról és érvényességéről a NAV adatbázisa alapján adatot szolgáltatni.
   * 
   * @param requestParams A lekérdezés paraméterei
   * @returns A NAV szervere által visszaadott válasz. Bővebb leírás: https://onlineszamla.nav.gov.hu/api/files/container/download/Online_Szamla_interfesz%20specifikacio_HU_v3.0.pdf -> QueryTaxpayerResponse
   */

  async queryTaxpayer(requestParams: QueryTaxpayerRequest) {
    try {
      const builder = new QueryTaxpayerRequestBuilder(requestParams, this.signatureKey);
      return await this.postRequest('queryTaxpayer', builder.requestXML);
    }
    catch (err) {
      return err;
    }
  }

  // ----------------------------------------------------------------

  /**
   * A queryInvoiceDigest üzleti keresőparaméterek alapján működő lekérdező operáció, amely a számlán szereplő kiállító és a vevő oldaláról is használható. 
   * Az operáció a megadott keresőfeltételeknek megfelelő, lapozható számla listát ad vissza a válaszban. 
   * A válasz nem tartalmazza a számlák összes üzleti adatát, hanem csak egy kivonatot (digest-et). 
   * Ha szükség van a listában szereplő valamely számla teljes adattartalmára, úgy azt a számlaszám birtokában a /queryInvoiceData operációban lehet lekérdezni.
   * 
   * @param requestParams A lekérdezés paraméterei
   * @returns A NAV szervere által visszaadott válasz. Bővebb leírás: https://onlineszamla.nav.gov.hu/api/files/container/download/Online_Szamla_interfesz%20specifikacio_HU_v3.0.pdf -> QueryInvoiceDigestResponse
   */

  async queryInvoiceDigest(requestParams: QueryInvoiceDigestRequestParams) {
    try {
      const builder = new QueryInvoiceDigestRequestBuilder(requestParams, this.signatureKey);
      return await this.postRequest('queryInvoiceDigest', builder.requestXML);
    }
    catch (error) {
      return error;
    }
  }

  // ----------------------------------------------------------------

  /**
   * A queryInvoiceData egy számlaszám alapján működő operáció, amely a számlán szereplő kiállító és a vevő oldaláról is használható. 
   * Az operáció a megadott számlaszám teljes adattartalmát adja vissza a válaszban.
   * 
   * @param requestParams A lekérdezés paraméterei
   * @param decodeInvoice Ha értéke true, akkor a számla adattartalma nemcsak BASE64-ben kerül vissza a válaszba, hanem dekoldólt adatként is megjelenik a 'decodedInvoiceData' csomóponton
   * @returns A NAV szervere által visszaadott válasz. Bővebb leírás: https://onlineszamla.nav.gov.hu/api/files/container/download/Online_Szamla_interfesz%20specifikacio_HU_v3.0.pdf -> QueryInvoiceDataResponse
   */

  async queryInvoiceData(requestParams: QueryInvoiceDataRequestParams, decodeInvoice: boolean = false) {
    const builder = new QueryInvoiceDataRequestBuilder(requestParams, this.signatureKey);
    try {
      const response = await this.postRequest('queryInvoiceData', builder.requestXML)
      // ha kérjük a számla dekódolását BASE64-ről akkor az eredeti response-ba beszúrjuk a számla dekódolt adatait, így esetleg kliens oldalon nem kell a dekódolással foglalkozni....
      if (decodeInvoice && (response.QueryInvoiceDataResponse.result.funcCode == 'OK') && (response.QueryInvoiceDataResponse.invoiceDataResult)) {
        const compressedContentIndicator = response.QueryInvoiceDataResponse.invoiceDataResult.compressedContentIndicator;

        let invoiceData = response.QueryInvoiceDataResponse.invoiceDataResult.invoiceData;
        invoiceData = Buffer.from(invoiceData, 'base64');

        // ha tömörítve van a számla akkor kitömörítjük...
        if (compressedContentIndicator) {
           invoiceData = zlib.unzipSync(invoiceData);
        }

        const xmlParser = new xml2js.Parser({ explicitArray: false });
        const parseXml = promisify(xmlParser.parseString).bind(xmlParser);
        const decodedData = await parseXml(invoiceData.toString('utf-8'));

        response.QueryInvoiceDataResponse.invoiceDataResult['decodedInvoiceData'] = decodedData;
      }

      return response;
    }
    catch (error) {
      return error;
    }
  }
}