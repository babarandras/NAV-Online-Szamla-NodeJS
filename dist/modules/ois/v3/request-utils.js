"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseRequest = exports.requestSignature = exports.newRequestID = exports.passwordHash = void 0;
const crypto_1 = __importDefault(require("crypto"));
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
function baseRequest(requestParams) {
}
exports.baseRequest = baseRequest;
//# sourceMappingURL=request-utils.js.map