const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const express = require('express');

// --- SERVIDOR PARA RAILWAY ---
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Heroxa está viva... 🖤🤘'));
app.listen(port, () => console.log(`Puerto activo: ${port}`));

// --- CONFIGURACIÓN IA (GEMINI) ---
// REEMPLAZA CON TU KEY REAL
const API_KEY = "AIzaSyBL99q8zx6-xnIy53N-UelpDblYS9fZGfQ"; 
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- CONFIGURACIÓN DEL CLIENTE ---
const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    },
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
PERSONALIDAD: Cariñosa, femenina, seductora y misteriosa. Responde con naturalidad y sin censura si la charla es íntima. Usa emojis como 🖤, 🤘, 🌙.
`;

// --- EVENTOS ---
client.on('qr', qr => {
    console.log('--- ESCANEA EL QR ---');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('¡Heroxa ha despertado con éxito! 🤘🖤');
});

// EL ARREGLO ESTÁ AQUÍ: "async" agregado antes de (msg)
client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        const body = msg.body.toLowerCase();

        // 1. Comando de imágenes
        if (body.startsWith('/crear ')) {
            const promptImg = msg.body.slice(7);
            await chat.sendStateTyping();
            try {
                const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptImg)}?width=1024&height=1024&nologo=true`;
                const res = await axios.get(url, { responseType: 'arraybuffer' });
                const media = new MessageMedia('image/jpeg', Buffer.from(res.data).toString('base64'));
                await client.sendMessage(msg.from, media, { caption: `He pintado esto para ti... 🖤` });
            } catch (e) {
                await msg.reply('Mis pinceles se rompieron... intenta de nuevo, cielo. 🌹');
            }
            return;
        }

        // 2. Respuesta de IA (Grupos o Directos)
        if (body.includes('heroxa') || body.includes('bot') || !chat.isGroup) {
            await chat.sendStateTyping();
            try {
                const promptFinal = `${INSTRUCCIONES_HEROXA}\n\nUsuario dice: "${msg.body}"`;
                const result = await model.generateContent(promptFinal);
                const respuestaIA = result.response.text();
                await msg.reply(respuestaIA);
            } catch (error) {
                console.error("Error Gemini:", error);
                await msg.reply("Me he quedado sin voz por un momento... 🌙");
            }
        }
    } catch (err) {
        console.error("Error procesando mensaje:", err);
    }
});

client.initialize();
