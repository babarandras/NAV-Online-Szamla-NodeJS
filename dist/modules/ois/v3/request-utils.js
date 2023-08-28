"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRequest = exports.requestSignature = exports.newRequestID = exports.passwordHash = void 0;
const classes_1 = require("./classes");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const xml2js_1 = __importDefault(require("xml2js"));
const util_1 = require("util");
const lodash_1 = __importDefault(require("lodash"));
const { pick } = lodash_1.default;
const xmlParser = new xml2js_1.default.Parser({ explicitArray: false });
const parseXml = (0, util_1.promisify)(xmlParser.parseString).bind(xmlParser);
/**
 * jelszó Hash az Online Számla 3.0 rendszer interfész specifikáció alapján
 * @param password az Online Számla rendszerhez tartozó egyedi jelszó
 * @returns a megadott jelszó hash-el értéke
 */
function passwordHash(password) {
    const hash = crypto_1.default
        .createHash("sha512")
        .update(password)
        .digest("hex")
        .toUpperCase();
    return hash;
}
exports.passwordHash = passwordHash;
/**
 * Új request ID generálása az Online Számla 3.0 rendszer interfész specifikáció alapján. A request ID az 'RID' előtaggal fog kezdődni
 * @returns {string} RequestID értéke
 */
function newRequestID() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_+';
    const patternLength = 27;
    let requestID = "RID";
    for (let i = 0; i < patternLength; i++) {
        const index = crypto_1.default.randomInt(0, characters.length);
        requestID += characters[index];
    }
    return requestID;
}
exports.newRequestID = newRequestID;
/**
 * Interface kérés aláírása a megadott paraméterek alapján
 * @param requestID Egyedi kérés azonosító, értékét a newRequestID() függvényel generálhatjuk
 * @param date A kérés időpontja, dátuma
 * @param signatureKey Aláírási kulcs
 * @param invoices Számla vagy számlák xml tartalma base64-ben
 * @returns
 */
function requestSignature(requestID, date, signatureKey, invoices = []) {
    const timestamp = date.toISOString().split('.')[0].replace(/[-:T]/g, '');
    ;
    const invoicesChecksum = invoices
        .map((invoice) => {
        const hash = crypto_1.default
            .createHash('sha3-512')
            .update(`${invoice.operation}${invoice.data}`)
            .digest('hex')
            .toUpperCase();
        return hash;
    })
        .join('');
    const signature = crypto_1.default
        .createHash('sha-512')
        .update(`${requestID}${timestamp}${signatureKey}${invoicesChecksum}`)
        .digest('hex')
        .toUpperCase();
    return signature;
}
exports.requestSignature = requestSignature;
/**
 *
 * @param requestParams
 */
function sendRequest(requestParams) {
    return __awaiter(this, void 0, void 0, function* () {
        const { baseURL, endPoint } = requestParams;
        const builder = new classes_1.RequestBuilder(requestParams);
        const requestXML = builder.requestXML;
        // egyedi axios példány létrehozása
        const navAxios = axios_1.default.create({
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
            const response = yield navAxios.post(endPoint, requestXML);
            const responseXML = response.data;
            // helyettesítsük az ns2 és ns3 válaszokat üres karakterláncra, mert névterekkel és névterek nélkül is kaphatunk válaszokat
            const noNsXml = response.data.replace(/ns2:|ns3:/g, '');
            response.data = yield parseXml(noNsXml);
            return Object.assign(Object.assign({}, response.data), { responseXML });
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
                }
                else if (response.data.includes('GeneralExceptionResponse')) {
                    // helyettesítsük az ns2 és ns3 válaszokat üres karakterláncra, mert névterekkel és névterek nélkül is kaphatunk válaszokat
                    const noNsXml = response.data.replace(/ns2:|ns3:/g, '');
                    const data = yield parseXml(noNsXml);
                    response.data = {
                        result: pick(data.GeneralExceptionResponse, [
                            'funcCode',
                            'errorCode',
                            'message',
                        ]),
                        technicalValidationMessages: [],
                    };
                }
                else if (response.data.includes('GeneralErrorResponse')) {
                    // helyettesítsük az ns2 és ns3 válaszokat üres karakterláncra, mert névterekkel és névterek nélkül is kaphatunk válaszokat
                    const noNsXml = response.data.replace(/ns2:|ns3:/g, '');
                    const data = yield parseXml(noNsXml);
                    response.data = pick(data.GeneralErrorResponse, [
                        'result',
                        'schemaValidationMessages',
                        'technicalValidationMessages',
                    ]);
                    const { technicalValidationMessages } = response.data;
                    // Normalizálja a technicalValidationMessages-t 
                    if (!response.data.technicalValidationMessages) {
                        response.data.technicalValidationMessages = [];
                    }
                    else if (!Array.isArray(technicalValidationMessages)) {
                        response.data.technicalValidationMessages = [
                            technicalValidationMessages,
                        ];
                    }
                }
                else {
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
    });
}
exports.sendRequest = sendRequest;
//# sourceMappingURL=request-utils.js.map