import path from 'path';
import dotenv from 'dotenv';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import * as deepl from 'deepl-node';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const authKey = process.env.DEEPL_AUTH_KEY;
if (!authKey) {
  throw new Error('DEEPL_AUTH_KEY is required');
}

const deeplClient = new deepl.DeepLClient(authKey);

export const translate = onCall(async (request) => {
  const { text, targetLang = 'PT-BR' } = request.data ?? {};

  if (typeof text !== 'string' || !text.trim()) {
    throw new HttpsError('invalid-argument', 'text is required');
  }

  try {
    const result = await deeplClient.translateText(text, null, targetLang);
    return {
      text: result.text,
      detectedSourceLang: result.detectedSourceLang,
    };
  } catch (error) {
    logger.error('translate failed', error);
    throw new HttpsError('internal', 'translation failed');
  }
});

export const translateHttp = onRequest(async (req, res) => {
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
  } catch (error) {
    logger.error('translateHttp failed', error);
    res.status(500).json({ error: 'translation failed' });
  }
});
