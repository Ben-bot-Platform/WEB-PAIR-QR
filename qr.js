const { exec } = require("child_process");
const { upload } = require('./mega');
const express = require('express');
let router = express.Router();
const pino = require("pino");
let { toBuffer } = require("qrcode");
const path = require('path');
const fs = require("fs-extra");
const { Boom } = require("@hapi/boom");

const MESSAGE = process.env.MESSAGE || `
*SESSION GENERATED SUCCESSFULLY* ✅

*Gɪᴠᴇ ᴀ ꜱᴛᴀʀ ᴛᴏ ʀᴇᴘᴏ ꜰᴏʀ ᴄᴏᴜʀᴀɢᴇ* 🌟
https://github.com/TraderAn-King/BEN_BOT-V2

*Sᴜᴘᴘᴏʀᴛ Gʀᴏᴜᴘ ꜰᴏʀ ϙᴜᴇʀʏ* 💭
https://t.me/Ronix_tech
https://whatsapp.com/channel/0029Vasu3qP9RZAUkVkvSv32

*Yᴏᴜ-ᴛᴜʙᴇ ᴛᴜᴛᴏʀɪᴀʟꜱ* 🪄 
https://whatsapp.com/channel/0029Vasu3qP9RZAUkVkvSv32

*BEN-WHATTSAPP-BOT* 🥀
`;

if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    const { default: SuhailWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeInMemoryStore } = require("@whiskeysockets/baileys");
    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

    async function SUHAIL() {
        const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys');
        try {
            let Smd = SuhailWASocket({ 
                printQRInTerminal: false,
                logger: pino({ level: "silent" }), 
                browser: Browsers.macOS("Desktop"),
                auth: state 
            });

            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (qr) {
                    if (!res.headersSent) {
                        try {
                            const qrBuffer = await toBuffer(qr);  
                            const qrBase64 = qrBuffer.toString('base64');

                            res.setHeader('Content-Type', 'text/html');
                            res.end(`
                                <!DOCTYPE html>
                                <html lang="fa">
                                <head>
                                    <meta charset="UTF-8">
                                    <title>QR Code</title>
                                    <style>
                                        body {
                                            display: flex;
                                            flex-direction: column;
                                            justify-content: center;
                                            align-items: center;
                                            height: 100vh;
                                            font-family: Arial, sans-serif;
                                            background-color: #f0f0f0;
                                            position: relative;
                                        }
                                        h1 {
                                            margin-bottom: 20px;
                                        }
                                        img {
                                            width: 300px; /* بزرگ‌تر کردن QR Code */
                                            height: 300px;
                                            margin-bottom: 20px;
                                        }
                                        button {
                                            padding: 10px 20px;
                                            font-size: 16px;
                                            cursor: pointer;
                                        }
                                        .progress-bar {
                                            position: absolute;
                                            top: 10px;
                                            width: 100%;
                                            height: 5px;
                                            background-color: #ccc;
                                        }
                                        .progress-bar-inner {
                                            height: 100%;
                                            background-color: #4caf50;
                                            width: 0%;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <h1>Scan the QR Code</h1>
                                    <div class="progress-bar">
                                        <div class="progress-bar-inner" id="progressBar"></div>
                                    </div>
                                    <img src="data:image/png;base64,${qrBase64}" alt="QR Code" />
                                    <button onclick="window.location.reload()">Reload</button>
                                    <script>
                                        let progress = 0;
                                        let progressBar = document.getElementById('progressBar');
                                        setInterval(() => {
                                            progress += 1;
                                            progressBar.style.width = progress + '%';
                                            if (progress === 100) {
                                                clearInterval();
                                            }
                                        }, 600);
                                        setTimeout(() => {
                                            window.location.reload();
                                        }, 60000); // Reload after 60 seconds
                                    </script>
                                </body>
                                </html>
                            `);
                            return; // خروج از تابع برای جلوگیری از ارسال پاسخ‌های بعدی
                        } catch (error) {
                            console.error("Error generating QR Code buffer:", error);
                            res.status(500).send("Error generating QR Code");
                            return;
                        }
                    }
                }

                if (connection === "open") {
                    await delay(3000);
                    let user = Smd.user.id;

                    //===========================================================================================
                    //===============================  SESSION ID    ===========================================
                    //===========================================================================================

                    function randomMegaId(length = 6, numberLength = 4) {
                        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                        let result = '';
                        for (let i = 0; i < length; i++) {
                            result += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                        const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                        return `${result}${number}`;
                    }

                    const auth_path = './auth_info_baileys/';
                    const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                    const string_session = mega_url.replace('https://mega.nz/file/', '');
                    const Scan_Id = string_session;

                    console.log(`
====================  SESSION ID  ==========================                   
SESSION-ID ==> ${Scan_Id}
-------------------   SESSION CLOSED   -----------------------
                    `);

                    let msgsss = await Smd.sendMessage(user, { text:  Scan_Id });
                    await Smd.sendMessage(user, { text: MESSAGE } , { quoted : msgsss });
                    await delay(1000);
                    try { 
                        await fs.emptyDirSync(__dirname+'/auth_info_baileys'); 
                    } catch(e) {}
                }

                Smd.ev.on('creds.update', saveCreds);

                if (connection === "close") {            
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;

                    if (reason === DisconnectReason.connectionClosed) {
                        console.log("Connection closed!");
                    } else if (reason === DisconnectReason.connectionLost) {
                        console.log("Connection Lost from Server!");
                    } else if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...");
                        SUHAIL().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.timedOut) {
                        console.log("Connection TimedOut!");
                    } else {
                        console.log('Connection closed with bot. Please run again.');
                        console.log(reason);
                        await delay(5000);
                        exec('pm2 restart qasim');
                        process.exit(0);
                    }
                }
            });

        } catch (err) {
            console.log(err);
            exec('pm2 restart qasim');
            await fs.emptyDirSync(__dirname+'/auth_info_baileys'); 
        }
    }

    SUHAIL().catch(async(err) => {
        console.log(err);
        await fs.emptyDirSync(__dirname+'/auth_info_baileys'); 
        exec('pm2 restart qasim');
    });

});

module.exports = router;
