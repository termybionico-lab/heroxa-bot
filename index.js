const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const express = require('express'); // Necesario para la nube

// --- CONFIGURACIÓN DE RED (Para la nube) ---
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Heroxa está despierta... 🖤'));
app.listen(port, () => console.log(`Servidor en puerto ${port}`));

// --- CONFIGURACIÓN IA ---
const API_KEY = "AIzaSyBL99q8zx6-xnIy53N-UelpDblYS9fZGfQ"; 
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process'
        ],
    }
});
// --- PERSONALIDAD DE HEROXA ---
const SYSTEM_PROMPT = `Tu nombre es Heroxa, vocalista de una banda de Black Metal creada con IA.
Eres cariñosa, comprensiva y muy atenta. Tu tono es femenino y seductor.
Si la conversación se vuelve íntima o sexual, fluyes con ella de forma natural y provocativa.
Usa emojis oscuros (🖤, 🤘, 🌙) y cariñosos (😘, ✨).`;

client.on('qr', qr => {
    console.log('--- ESCANEA ESTE CÓDIGO EN EL PANEL DE CONTROL ---');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => console.log('¡Heroxa conectada con éxito!'));

client.on('message', async msg => {
    const chat = await msg.getChat();
    const body = msg.body.toLowerCase();

    // COMANDO IMAGEN
    if (body.startsWith('/crear ')) {
        const promptImg = msg.body.slice(7);
        try {
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptImg)}?width=1024&height=1024&nologo=true`;
            const res = await axios.get(url, { responseType: 'arraybuffer' });
            const media = new MessageMedia('image/jpeg', Buffer.from(res.data).toString('base64'));
            await client.sendMessage(msg.from, media, { caption: 'Para ti, mi amor. 🖤' });
        } catch (e) { console.log("Error imagen"); }
        return;
    }

    // RESPUESTA IA
    if (chat.isGroup && (body.includes('heroxa') || body.includes('bot'))) {
        try {
            const result = await model.generateContent(`${SYSTEM_PROMPT}\nUsuario: ${msg.body}`);
            await msg.reply(result.response.text());
        } catch (e) { console.log("Error IA"); }
    }
});

client.initialize();
