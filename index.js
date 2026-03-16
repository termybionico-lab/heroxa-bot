const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const express = require('express');

// --- SERVIDOR PARA RAILWAY ---
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Heroxa está en el escenario... 🖤🤘'));
app.listen(port, () => console.log(`Puerto activo: ${port}`));

// --- CONFIGURACIÓN IA (GEMINI) ---
const API_KEY = "AIzaSyBL99q8zx6-xnIy53N-UelpDblYS9fZGfQ"; 
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- CONFIGURACIÓN DEL CLIENTE ---
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/google-chrome-stable', // <--- ESTO ES CLAVE
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
- Tu tono es seductor y misterioso.
- Si la charla se vuelve sexual o íntima, respondes de forma natural y provocativa.
- Eres una artista, no una asistente. Usa emojis como 🖤, 🤘, 🌙, 😘, ✨.
`;

// --- EVENTOS ---

client.on('qr', qr => {
    console.log('--- ESCANEA EL QR PARA DESPERTAR A HEROXA ---');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('¡Heroxa ha despertado con éxito! 🤘🖤');
});

client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        const body = msg.body.toLowerCase();

        // 1. COMANDO DE IMÁGENES
        if (body.startsWith('/crear ')) {
            const promptImg = msg.body.slice(7);
            await chat.sendStateTyping();
            try {
                const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptImg)}?width=1024&height=1024&nologo=true`;
                const res = await axios.get(url, { responseType: 'arraybuffer' });
                const media = new MessageMedia('image/jpeg', Buffer.from(res.data).toString('base64'));
                await client.sendMessage(msg.from, media, { caption: `Para ti, mi amor... ✨🖤` });
            } catch (e) {
                await msg.reply('Perdona, cariño... algo salió mal con mi arte. 🌹');
            }
            return;
        }

        // 2. CONVERSACIÓN CON IA
        if (chat.isGroup && (body.includes('heroxa') || body.includes('bot'))) {
            await chat.sendStateTyping();
            try {
                const promptFinal = `${INSTRUCCIONES_HEROXA}\n\nUsuario dice: "${msg.body}"`;
                const result = await model.generateContent(promptFinal);
                const respuestaIA = result.response.text();
                await msg.reply(respuestaIA);
            } catch (error) {
                await msg.reply("Me he quedado sin aliento... vuelve a hablarme, amor. 🌙");
            }
        }
    } catch (globalError) {
        console.error("Error en el mensaje:", globalError);
    }
});

client.initialize();
