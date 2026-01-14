"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateHttp = exports.translate = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const deepl = __importStar(require("deepl-node"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '..', '.env') });
const authKey = process.env.DEEPL_AUTH_KEY;
if (!authKey) {
    throw new Error('DEEPL_AUTH_KEY is required');
}
const deeplClient = new deepl.DeepLClient(authKey);
exports.translate = (0, https_1.onCall)(async (request) => {
    const { text, targetLang = 'PT-BR' } = request.data ?? {};
    if (typeof text !== 'string' || !text.trim()) {
        throw new https_1.HttpsError('invalid-argument', 'text is required');
    }
    try {
        const result = await deeplClient.translateText(text, null, targetLang);
        return {
            text: result.text,
            detectedSourceLang: result.detectedSourceLang,
        };
    }
    catch (error) {
        logger.error('translate failed', error);
        throw new https_1.HttpsError('internal', 'translation failed');
    }
});
exports.translateHttp = (0, https_1.onRequest)(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    const { text, targetLang = 'PT-BR' } = req.body ?? {};
    if (typeof text !== 'string' || !text.trim()) {
        res.status(400).json({ error: 'text is required' });
        return;
    }
    try {
        const result = await deeplClient.translateText(text, null, targetLang);
        res.json({
            text: result.text,
            detectedSourceLang: result.detectedSourceLang,
        });
    }
    catch (error) {
        logger.error('translateHttp failed', error);
        res.status(500).json({ error: 'translation failed' });
    }
});
