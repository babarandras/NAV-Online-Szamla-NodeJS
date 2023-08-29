import { RequestParams, QueryInvoiceDigestRequestParams } from './classes';
import { RequestBuilder, requestSignature, sendRequest } from "./request-utils";

export class NAVRestclient {
  private requestParams: RequestParams;

  constructor(requestParams: RequestParams) {
    this.requestParams = requestParams;
  }

  async tokenExchange() {
    let builder = new RequestBuilder('TokenExchangeRequest', this.requestParams);
    const requestXML = builder.requestXML;
    const response = await sendRequest(this.requestParams.baseURL, 'tokenExchange', requestXML);
    return response;
  }

  async queryTaxpayer(taxNumber: string) {
    let builder = new RequestBuilder('QueryTaxpayerRequest', this.requestParams);
    let request = builder.request;
    request.QueryTaxpayerRequest.taxNumber = taxNumber;
    const response = await sendRequest(this.requestParams.baseURL, 'queryTaxpayer', builder.requestXML);
    return response;
  }

  async queryInvoiceDigest(params: QueryInvoiceDigestRequestParams) {
    let builder = new RequestBuilder('QueryInvoiceDigestRequest', this.requestParams);
    let request = builder.request;
    request.QueryInvoiceDigestRequest = params;
    /*request.QueryInvoiceDigestRequest.page = 1;
    request.QueryInvoiceDigestRequest.invoiceDirection = 'INBOUND';
    request.QueryInvoiceDigestRequest.invoiceQueryParams = {};
    request.QueryInvoiceDigestRequest.invoiceQueryParams.mandatoryQueryParams = {};
    request.QueryInvoiceDigestRequest.invoiceQueryParams.mandatoryQueryParams.invoiceIssueDate = {};
    request.QueryInvoiceDigestRequest.invoiceQueryParams.mandatoryQueryParams.invoiceIssueDate.dateFrom = '2023-08-20';
    request.QueryInvoiceDigestRequest.invoiceQueryParams.mandatoryQueryParams.invoiceIssueDate.dateTo = '2023-08-20';
    */

    const response = await sendRequest(this.requestParams.baseURL, 'queryInvoiceDigest', builder.requestXML);
    return response;
  }
}