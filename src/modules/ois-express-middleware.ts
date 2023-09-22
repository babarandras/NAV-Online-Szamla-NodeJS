/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Request, Response, NextFunction } from 'express';
import { OnlineInvoiceRestClient } from './ois-rest-client';
import { QueryInvoiceDigestRequestParams, QueryInvoiceDataRequestParams, QueryTaxpayerRequest } from './ois-request-utils';

// ----------------------------------------------------------------

function queryInvoiceDigest(req: Request, res: Response, next: NextFunction) {
  const params = new QueryInvoiceDigestRequestParams();
  const queryInvoiceDigestRequest = req.body.QueryInvoiceDigestRequest;

  params.header = queryInvoiceDigestRequest.header;
  params.user = queryInvoiceDigestRequest.user;
  params.software = queryInvoiceDigestRequest.software;
  params.page = queryInvoiceDigestRequest.page;
  params.invoiceDirection = queryInvoiceDigestRequest.invoiceDirection;
  params.invoiceQueryParams = queryInvoiceDigestRequest.invoiceQueryParams;

  const client = new OnlineInvoiceRestClient();
  client.signatureKey = req.body.signatureKey;
  client.queryInvoiceDigest(params).then((response) => {
    res.send(response);
  })
}

// ----------------------------------------------------------------

function queryInvoiceData(req: Request, res: Response, next: NextFunction) {
  const params = new QueryInvoiceDataRequestParams();
  const queryInvoiceDataRequest = req.body.QueryInvoiceDataRequest;

  params.header = queryInvoiceDataRequest.header;
  params.user = queryInvoiceDataRequest.user;
  params.software = queryInvoiceDataRequest.software;
  params.invoiceNumberQuery = queryInvoiceDataRequest.invoiceNumberQuery;

  const client = new OnlineInvoiceRestClient();
  client.signatureKey = req.body.signatureKey;
  client.queryInvoiceData(params, true).then((response) => {
    res.status(200).json(response);
  })
}

// ----------------------------------------------------------------

function queryTaxpayer(req: Request, res: Response, next: NextFunction) {
  const params = new QueryTaxpayerRequest();
  const queryTaxpayerRequest = req.body.QueryTaxpayerRequest;

  params.header = queryTaxpayerRequest.header;
  params.user = queryTaxpayerRequest.user;
  params.software = queryTaxpayerRequest.software;
  params.taxNumber = queryTaxpayerRequest.taxNumber;

  const client = new OnlineInvoiceRestClient();
  client.signatureKey = req.body.signatureKey;
  client.queryTaxpayer(params).then((response) => {
    res.status(200).json(response);
  })
}

// ----------------------------------------------------------------

export function operationMiddlewares(req: Request, res: Response, next: NextFunction) {
  const operation = req.body.operation;
  try {
    switch (operation) {
      case 'queryInvoiceDigest': {
        queryInvoiceDigest(req, res, next);
        break;
      }
      case 'queryInvoiceData': {
        queryInvoiceData(req, res, next);
        break;
      }
      case 'queryTaxpayer': {
        queryTaxpayer(req, res, next);
        break;
      }
      default: {
        res.status(404).json({ "error": "Nem létező operáció" });
        break;
      }
    }
  }
  catch (err) {
    next(err)
  }
}