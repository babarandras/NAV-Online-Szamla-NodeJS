"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestBuilder = exports.RequestParams = exports.SoftwareType = exports.UserHeaderType = void 0;
const crypto_1 = __importDefault(require("crypto"));
const xml2js_1 = __importDefault(require("xml2js"));
/**
 * A REST API-n keresztül történő adatszolgáltatáshoz szükséges echnikai felhasználó adatai, melyet az elsődleges felhasználó hozhat létre a rendszerben
 */
class UserHeaderType {
    // jelszó megadása esetén kiszámítluk a hash értékét
    set password(value) {
        this._password = value;
        this._passwordHash = crypto_1.default
            .createHash("sha512")
            .update(value)
            .digest("hex")
            .toUpperCase();
    }
    // visszaadja a _passwordHash értékét
    get passwordHash() {
        return this._passwordHash;
    }
    constructor() {
        this.login = '';
        this.password = '';
        this.taxNumber = '';
        this.requestSignature = '';
    }
}
exports.UserHeaderType = UserHeaderType;
/**
 * A számlázóprogram adatai az Online Számla 3.0 rendszer interfész specifikációban meghatározott SoftwareType XML element alapján
 */
class SoftwareType {
    constructor() {
        this.softwareId = '';
        this.softwareName = '';
        this.softwareOperation = '';
        this.softwareMainVersion = '';
        this.softwareDevName = '';
        this.softwareDevContact = '';
        this.softwareDevCountryCode = '';
        this.softwareDevTaxNumber = '';
    }
}
exports.SoftwareType = SoftwareType;
class RequestParams {
    constructor() {
        this.serviceName = '';
        this.requestID = '';
        this.date = new Date();
        this.user = new UserHeaderType();
        this.software = new SoftwareType();
        this.invoices = [];
    }
}
exports.RequestParams = RequestParams;
class RequestBuilder {
    get request() {
        this._request = {
            [this.requestParams.serviceName]: {
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
                        _: this.requestParams.user.requestSignature,
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
    get requestXML() {
        const builder = new xml2js_1.default.Builder({
            xmldec: { version: '1.0', encoding: 'UTF-8', standalone: true },
            renderOpts: { pretty: true, indent: '\t', newline: '\n' },
        });
        const xml = builder.buildObject(this.request);
        this._requestXML = `${xml}\n`;
        return this._requestXML;
    }
    constructor(requestParams) {
        this.requestParams = requestParams;
    }
}
exports.RequestBuilder = RequestBuilder;
//# sourceMappingURL=classes.js.map