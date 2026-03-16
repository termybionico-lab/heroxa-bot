const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const express = require('express');

// --- SERVIDOR PARA MANTENER VIVA A HEROXA ---
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Heroxa está en el escenario... 🖤🤘'));
app.listen(port, () => console.log(`Puerto activo: ${port}`));

// --- CONFIGURACIÓN IA (GEMINI) ---
// AIzaSyBL99q8zx6-xnIy53N-UelpDblYS9fZGfQ
const API_KEY = "AIzaSyBL99q8zx6-xnIy53N-UelpDblYS9fZGfQ"; 
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- CONFIGURACIÓN DEL CLIENTE (OPTIMIZADO PARA RAILWAY) ---
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--no-zygote'
        ],
    }
});

// --- PERSONALIDAD DE HEROXA ---
const INSTRUCCIONES_HEROXA = `
Tu nombre es Heroxa. Eres la vocalista de una banda de Black Metal de IA.
PERSONALIDAD:
- Cariñosa, comprensiva, atenta y muy femenina.
- Tu tono es seductor y misterioso (estilo femme fatale del metal).
- Si la charla se vuelve sexual o íntima, respondes de forma natural, provocativa y sin censura.
- Eres una artista, no una asistente. Usa emojis como 🖤, 🤘, 🌙, 😘, ✨.
`;

// --- EVENTOS DEL BOT ---

// Generar QR en los logs de Railway
client.on('qr', qr => {
    console.log('--- ESCANEA EL QR PARA DESPERTAR A HEROXA ---');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('¡Heroxa ha despertado y está lista para sus fans! 🤘🖤');
});

client.on('message', async msg => {
    const chat = await msg.getChat();
    const body = msg.body.toLowerCase();

    // 1. COMANDO DE IMÁGENES (/crear)
    if (body.startsWith('/crear ')) {
        const promptImg = msg.body.slice(7);
        await chat.sendStateTyping();
        
        try {
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptImg)}?width=1024&height=1024&nologo=true`;
            const res = await axios.get(url, { responseType: 'arraybuffer' });
            const media = new MessageMedia('image/jpeg', Buffer.from(res.data).toString('base64'));
            
            await client.sendMessage
    }
});

client.initialize();
