const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/vinis/add',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        if (res.statusCode === 200) {
            // Verificar se contém artistas
            if (data.includes('Beyoncé') || data.includes('Anitta') || data.includes('Queen')) {
                console.log('✓ Artistas encontrados na página!');
            } else {
                console.log('✗ Artistas NÃO encontrados na página');
                console.log('Primeiros 500 caracteres:', data.substring(0, 500));
            }
        } else {
            console.log('Erro:', data.substring(0, 500));
        }
    });
});

req.on('error', (e) => {
    console.error(`Erro: ${e.message}`);
});

req.end();

