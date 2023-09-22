/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import crypto from "crypto";
import xml2js from 'xml2js';

export class BasicOnlineInvoiceRequestParamsType {
  public header = {
    requestId: '',
    timestamp: '',
    requestVersion: '3.0',
    headerVersion: '1.0'
  };

  public user = {
    login: '',
    password: '',
    taxNumber: '',
    requestSignature: ''
  };

  public software = {
    softwareId: '',
    softwareName: '',
    softwareOperation: '',
    softwareMainVersion: '',
    softwareDevName: '',
    softwareDevContact: '',
    softwareDevCountryCode: '',
    softwareDevTaxNumber: ''
  };
}

// ----------------------------------------------------------------

class BasicOnlineInvoiceRequestBuidler {  
  protected requestParams = new BasicOnlineInvoiceRequestParamsType();
  private signatureKey = '';
  protected serviceName = '';

  constructor(requestParams: BasicOnlineInvoiceRequestParamsType, signatureKey: string) {
    this.requestParams = requestParams;
    this.signatureKey = signatureKey;
  }

  public get requestID(): string {
    let rID: string = 'RID';
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_+';
    const patternLength = 27; // 30 - 3 (RID) = 27;
    for (let i = 0; i < patternLength; i++) {
      const index = crypto.randomInt(0, characters.length);
      rID += characters[index];
    }
    return rID;
  }

  public get passwordHash(): string {   
    const user = this.requestParams.user;
    return crypto
      .createHash('sha512')
      .update(user.password)
      .digest('hex')
      .toUpperCase()
  }

  // kérés aláírása...
  public get requestSignature(): string {
    const header = this.requestParams.header;
    // kérés idejének lekérdezése és átalakítása a dokumentáció szerint...
    const timestamp = header.timestamp.split('.')[0].replace(/[-:T]/g, '');

    // számlák  ellenőrző összege (egyenlőre még nincs, egy konstans értéket adunk)
    const invoicesChechkSum = '';
    // példa a számlák ellenőrző összegére...
    /*if (requestParams.invoices) {
      invoicesChecksum = requestParams.invoices
        .map((invoice: any) => {
          const hash = crypto
            .createHash('sha3-512')
            .update(`${invoice.operation}${invoice.data}`)
            .digest('hex')
            .toUpperCase();
          return hash;
        })
        .join('');
    }*/

    return crypto
      .createHash('sha3-512')
      .update(`${header.requestId}${timestamp}${this.signatureKey}${invoicesChechkSum}`)
      .digest('hex')
      .toUpperCase();
  }

  public get request() {
    const header = this.requestParams.header;

    header.requestId = header.requestId || this.requestID;
    header.timestamp = header.timestamp || new Date().toISOString();

    const data = {
      [this.serviceName]: {
        $: {
          'xmlns': 'http://schemas.nav.gov.hu/OSA/3.0/api',
          'xmlns:common': 'http://schemas.nav.gov.hu/NTCA/1.0/common'
        },
        'common:header': {
          'common:requestId': this.requestParams.header.requestId,
          'common:timestamp': this.requestParams.header.timestamp,
          'common:requestVersion': this.requestParams.header.requestVersion,
          'common:headerVersion': this.requestParams.header.headerVersion,
        },
        'common:user': {
          'common:login': this.requestParams.user.login,
          'common:passwordHash': {
            $: {
              cryptoType: 'SHA-512'
            },
            _: this.passwordHash
          },
          'common:taxNumber': this.requestParams.user.taxNumber,
          'common:requestSignature': {
            $: {
              cryptoType: 'SHA3-512',
            },
            _: this.requestSignature
          }
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
        }
      }
    };
    return data;
  }

  public get requestXML() {
    const builder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8', standalone: true },
      renderOpts: { pretty: true, indent: '\t', newline: '\n' },
    });
    const xml = builder.buildObject(this.request);
    return `${xml}\n`;
  }
}

// ----------------------------------------------------------------

export class QueryTaxpayerRequest extends BasicOnlineInvoiceRequestParamsType {
  public taxNumber = '';
}

// ----------------------------------------------------------------

export class QueryTaxpayerRequestBuilder extends BasicOnlineInvoiceRequestBuidler {
  constructor(requestParams: QueryTaxpayerRequest, signatureKey: string) {
    super(requestParams, signatureKey) ;
    this.serviceName = 'QueryTaxpayerRequest';
  }

  public get request() {
    const data = super.request;
    data[this.serviceName]['taxNumber'] = (this.requestParams as QueryTaxpayerRequest).taxNumber;
    return data;
  }
}

// ----------------------------------------------------------------

export class QueryInvoiceDigestRequestParams extends BasicOnlineInvoiceRequestParamsType {
  public page = 1;
  public invoiceDirection = 'OUTBOUND';
  public invoiceQueryParams = {
    mandatoryQueryParams: {
      invoiceIssueDate: {
        dateFrom: '',
        dateTo: ''
      },
      insDate: {
        dateTimeFrom: '',
        dateTimeTo: ''
      },
      originalInvoiceNumber: ''
    },

    additionalQueryParams: {
      taxNumber: '',
      groupMemberTaxNumber: '',
      name: '',
      invoiceCategory: '',
      paymentMethod: '',
      invoiceAppearance: '',
      source: '',
      currency: ''
    },

    relationalQueryParams: {
      // TODO: check
    },

    transactionQueryParams: {
      transactionID: '',
      index: '',
      invoiceOperation: '',
    }
  }
}

// ----------------------------------------------------------------

export class QueryInvoiceDigestRequestBuilder extends BasicOnlineInvoiceRequestBuidler {
  constructor(requestParams: QueryInvoiceDigestRequestParams, signatureKey: string) {
    super(requestParams, signatureKey);
    this.serviceName = 'QueryInvoiceDigestRequest';
  }

  public get request() {
    const data = super.request;
    const requestParams = this.requestParams as QueryInvoiceDigestRequestParams;
    const requestService = data[this.serviceName];

    const invoiceQueryParams: {
      // kötelező keresési paraméterek
      mandatoryQueryParams: {
        invoiceIssueDate: {
          dateFrom: string,
          dateTo: string
        },
        insDate?: {
          dateTimeFrom: string,
          dateTimeTo: string
        },
        originalInvoiceNumber?: string
      },
      // kiegészítő keresőparaméterek
      additionalQueryParams?: {
        taxNumber?: string,
        groupMemberTaxNumber?: string,
        name?: string,
        invoiceCategory?: string,
        paymentMethod?: string,
        invoiceAppearance?: string;
        sopurce?: string;
        currency?: string
      },
      // relációs keresőparaméterek
      relationalQueryParams?: {
        invoiceDelivery?: {
          queryOperator: string,
          queryValue: string,
        },
        paymentDate?: {
          queryOperator: string,
          queryValue: string,
        },
        invoiceNetAmount?: {
          queryOperator: string,
          queryValue: number,
        },
        invoiceNetAmountHUF?: {
          queryOperator: string,
          queryValue: number,
        },
        invoiceVatAmount?: {
          queryOperator: string,
          queryValue: number,
        },
        invoiceVatAmountHUF?: {
          queryOperator: string,
          queryValue: number,
        }
      },
      // tranzakciós keresőparaméterek
      transactionQueryParams?: {
        transactionId?: string,
        index?: number,
        invoiceOperation?: string
      }
    } = {
      mandatoryQueryParams: {
        invoiceIssueDate: {
          dateFrom: '',
          dateTo: ''
        },
      }
    };

    invoiceQueryParams.mandatoryQueryParams.invoiceIssueDate = requestParams.invoiceQueryParams.mandatoryQueryParams.invoiceIssueDate;

    requestService['page'] = requestParams.page;
    requestService['invoiceDirection'] = requestParams.invoiceDirection;
    requestService['invoiceQueryParams'] = invoiceQueryParams;

    return data;
  }
}

// ----------------------------------------------------------------

export class QueryInvoiceDataRequestParams extends BasicOnlineInvoiceRequestParamsType {
  public invoiceNumberQuery = {
    invoiceNumber: '',
    invoiceDirection: 'INBOUND',
    batchIndex: undefined,
    supplierTaxNumber: undefined,
  }
}

// ----------------------------------------------------------------

export class QueryInvoiceDataRequestBuilder extends BasicOnlineInvoiceRequestBuidler {
  constructor(requestParams: QueryInvoiceDataRequestParams, signatureKey: string) {
    super(requestParams, signatureKey);
    this.serviceName = 'QueryInvoiceDataRequest';
  }

  public get request() {
    const data = super.request;
    const requestParams = this.requestParams as QueryInvoiceDataRequestParams;
    const requestService = data[this.serviceName];

    const invoiceNumberQuery: {
      invoiceNumber?: string,
      invoiceDirection?: string,
      batchIndex?: number,
      supplierTaxNumber?: string
    } = {};

    invoiceNumberQuery.invoiceNumber = requestParams.invoiceNumberQuery.invoiceNumber;
    invoiceNumberQuery.invoiceDirection = requestParams.invoiceNumberQuery.invoiceDirection;
    if ((requestParams.invoiceNumberQuery.batchIndex) && (requestParams.invoiceNumberQuery.batchIndex > 0)) {
      invoiceNumberQuery.batchIndex = requestParams.invoiceNumberQuery.batchIndex;
    }
    if (requestParams.invoiceNumberQuery.supplierTaxNumber) {
      invoiceNumberQuery.supplierTaxNumber = requestParams.invoiceNumberQuery.supplierTaxNumber;
    }

    requestService['invoiceNumberQuery'] = invoiceNumberQuery;

    return data;
  }
}