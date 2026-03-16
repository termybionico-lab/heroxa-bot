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
const API_KEY = "AIzaSyBL99q8zx6-xnIy53N-UelpDblYS9fZGfQ"; 
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- CONFIGURACIÓN DEL CLIENTE ---
const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1018.910-alpha.html',
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
const INSTRUCCIONES_HEROXA = "Tu nombre es Heroxa, vocalista de Black Metal. Eres seductora, oscura y directa. Usa emojis 🖤🤘.";

// --- EVENTOS ---
client.on('qr', qr => {
    console.log('--- NUEVO QR GENERADO ---');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('¡Heroxa ha despertado con éxito! 🤘🖤');
});

// --- EL BLOQUE QUE DEBES REVISAR ---
client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        const body = msg.body.toLowerCase();

        console.log(`Mensaje recibido de ${msg.from}: ${msg.body}`);

        // Solo responde si no es un grupo (privado) o si mencionan su nombre
        if (!chat.isGroup || body.includes('heroxa')) {
            
            try {
                const promptFinal = `${INSTRUCCIONES_HEROXA}\n\nUsuario dice: "${msg.body}"`;
                const result = await model.generateContent(promptFinal);
                const respuestaIA = result.response.text();

                // ENVIAR MENSAJE DIRECTO
                await client.sendMessage(msg.from, respuestaIA);
                console.log("¡Respuesta enviada a WhatsApp!");

            } catch (errorIA) {
                console.error("Error en Gemini:", errorIA);
            }
        }
    } catch (err) {
        console.error("Error crítico:", err);
    }
});

client.initialize();
