const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = 3000;
const API_URL = "https://axsports1.stream/api/fixtures/featured?only_upcomming=1&limit=50";

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Endpoint del Proxy para la API principal
    if (req.url === '/api/fixtures') {
        https.get(API_URL, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error("Error al consultar la API externa:", err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Error al obtener datos de la API externa" }));
        });
        return;
    }

    // Endpoint del Proxy para Ligas
    if (req.url === '/api/leagues') {
        const LEAGUES_URL = "https://axsports1.stream/game/leagues";
        https.get(LEAGUES_URL, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error("Error obteniendo ligas:", err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Proxy error fetching leagues" }));
        });
        return;
    }

    // Endpoint del Proxy para Canales Online
    if (req.url === '/api/channels') {
        const CHANNELS_URL = "https://la18hd.com/status.json";
        https.get(CHANNELS_URL, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => { data += chunk; });
            apiRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error("Error obteniendo canales:", err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Proxy error fetching channels" }));
        });
        return;
    }

    // Endpoint del Proxy para Canales Online 2 (Live TV 2)
    if (req.url === '/api/channels2') {
        const CHANNELS2_URL = "https://streamtpday1.xyz/status.json";
        https.get(CHANNELS2_URL, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => { data += chunk; });
            apiRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error("Error obteniendo canales 2:", err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Proxy error fetching channels 2" }));
        });
        return;
    }

    // Endpoint del Proxy para Canales Online 3 (Live TV 3)
    if (req.url === '/api/channels3') {
        const CHANNELS3_URL = "https://daddylive.eu/player/player3.json";
        https.get(CHANNELS3_URL, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => { data += chunk; });
            apiRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error("Error obteniendo canales 3:", err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Proxy error fetching channels 3" }));
        });
        return;
    }

    // Endpoint del Proxy para Canales Online 4 (Live TV 4)
    if (req.url === '/api/channels4') {
        const CHANNELS4_URL = "https://daddylive.eu/player/player6.json";
        https.get(CHANNELS4_URL, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => { data += chunk; });
            apiRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error("Error obteniendo canales 4:", err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Proxy error fetching channels 4" }));
        });
        return;
    }

    // Endpoint del Proxy para Canales Online 5 (Live TV 5)
    if (req.url === '/api/channels5') {
        const CHANNELS5_URL = "https://daddylive.eu/player/player9.json";
        https.get(CHANNELS5_URL, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => { data += chunk; });
            apiRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error("Error obteniendo canales 5:", err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Proxy error fetching channels 5" }));
        });
        return;
    }

    // Endpoint del Proxy para Canales Online 6 (Live TV 6)
    if (req.url === '/api/channels6') {
        const CHANNELS6_URL = "https://daddylive.eu/player/player10.json";
        https.get(CHANNELS6_URL, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => { data += chunk; });
            apiRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error("Error obteniendo canales 6:", err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Proxy error fetching channels 6" }));
        });
        return;
    }

    // Endpoint del Proxy para Logos de Canales
    if (req.url === '/api/channel-logos') {
        const LOGOS_URL = "https://raw.githubusercontent.com/darlyn-alexis/Darlyn/refs/heads/main/logo.txt";
        https.get(LOGOS_URL, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => { data += chunk; });
            apiRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error("Error obteniendo logos de canales:", err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Proxy error fetching channel logos" }));
        });
        return;
    }

    // Endpoint del Proxy para Agenda
    if (req.url === '/api/agenda') {
        const AGENDA_URL = "https://la18hd.com/eventos/json/agenda123.json";
        https.get(AGENDA_URL, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => { data += chunk; });
            apiRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error("Error obteniendo agenda:", err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Proxy error fetching agenda" }));
        });
        return;
    }

    // Endpoint del Proxy para Agenda 2
    if (req.url === '/api/agenda2') {
        const AGENDA2_URL = "https://streamtpday1.xyz/wc.json";
        https.get(AGENDA2_URL, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => { data += chunk; });
            apiRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error("Error obteniendo agenda 2:", err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Proxy error fetching agenda 2" }));
        });
        return;
    }

    // Endpoint del Proxy para Lives Streams generales
    if (req.url === '/api/fixtures/livestream') {
        const LIVE_URL = "https://axsports1.stream/api/fixtures/livestream";
        https.get(LIVE_URL, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error("Error al consultar la API de livestream:", err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Error al obtener datos de la API de livestream" }));
        });
        return;
    }

    // Endpoint del Proxy para Livestream
    if (req.url.startsWith('/api/livestream')) {
        const urlObj = new URL(req.url, `http://${req.headers.host}`);
        const fixtureId = urlObj.searchParams.get('id');
        if (!fixtureId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Falta el parámetro id del encuentro" }));
            return;
        }

        const streamUrl = `https://axsports1.stream/game/fixtures/${fixtureId}/livestream`;
        https.get(streamUrl, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error("Error al consultar streaming API:", err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Error al obtener livestream" }));
        });
        return;
    }

    // Endpoint del Proxy para Detalles del Encuentro
    if (req.url.startsWith('/api/fixture-details')) {
        const urlObj = new URL(req.url, `http://${req.headers.host}`);
        const fixtureId = urlObj.searchParams.get('id');
        if (!fixtureId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Falta el parámetro id del encuentro" }));
            return;
        }

        const detailsUrl = `https://axsports1.stream/game/fixtures/${fixtureId}`;
        https.get(detailsUrl, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error("Error al consultar detalles del encuentro API:", err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 1, message: "Error al obtener detalles del encuentro" }));
        });
        return;
    }

    // Servir archivos estáticos
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Archivo no encontrado</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Error interno del servidor: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` Servidor deportivo corriendo en: http://localhost:${PORT}`);
    console.log(`==================================================`);
});
