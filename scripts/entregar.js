/**
 * entregar.js — Envia slides de um carrossel para o Telegram
 *
 * Uso:
 *   node scripts/entregar.js <pasta-do-carrossel>
 *   node scripts/entregar.js --teste
 *
 * Exemplos:
 *   node scripts/entregar.js output/carrossel-produtividade/
 *   node scripts/entregar.js --teste
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Carrega variáveis de ambiente do config/.env
function carregarEnv() {
  const envPath = path.join(__dirname, '..', 'config', '.env');

  if (!fs.existsSync(envPath)) {
    console.error('Erro: config/.env não encontrado.');
    console.error('Configure o Telegram usando o comando /entregar no Claude Code.');
    process.exit(1);
  }

  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  const env = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && rest.length > 0) {
      env[key.trim()] = rest.join('=').trim();
    }
  }

  return env;
}

// Envia uma mensagem de texto simples (para teste)
function enviarMensagem(token, chatId, texto) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ chat_id: chatId, text: texto });
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (parsed.ok) resolve(parsed);
        else reject(new Error(`Telegram API: ${parsed.description}`));
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Envia uma foto para o Telegram com multipart/form-data
function enviarFoto(token, chatId, imagePath) {
  return new Promise((resolve, reject) => {
    const boundary = `----FormBoundary${Date.now()}`;
    const fileBuffer = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);

    const header = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([header, fileBuffer, footer]);

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendPhoto`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (parsed.ok) resolve(parsed);
        else reject(new Error(`Telegram API (${res.statusCode}): ${parsed.description}`));
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Envia como documento (fallback para arquivos grandes)
function enviarDocumento(token, chatId, imagePath) {
  return new Promise((resolve, reject) => {
    const boundary = `----FormBoundary${Date.now()}`;
    const fileBuffer = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);

    const header = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([header, fileBuffer, footer]);

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendDocument`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (parsed.ok) resolve(parsed);
        else reject(new Error(`Telegram API (${res.statusCode}): ${parsed.description}`));
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const env = carregarEnv();
  const { TELEGRAM_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = env;

  if (!token || !chatId) {
    console.error('Erro: TELEGRAM_TOKEN ou TELEGRAM_CHAT_ID não definidos em config/.env');
    process.exit(1);
  }

  const arg = process.argv[2];

  // Modo teste
  if (arg === '--teste') {
    console.log('Enviando mensagem de teste...');
    try {
      await enviarMensagem(token, chatId, 'Máquina de Posts conectada. Tudo funcionando.');
      console.log('Teste bem-sucedido. Telegram configurado corretamente.');
    } catch (err) {
      console.error('Erro no teste:', err.message);
      process.exit(1);
    }
    return;
  }

  // Modo envio de carrossel
  if (!arg) {
    console.error('Erro: informe a pasta do carrossel.');
    console.error('Uso: node scripts/entregar.js output/carrossel-tema/');
    process.exit(1);
  }

  const carrosselPath = path.resolve(arg);

  if (!fs.existsSync(carrosselPath)) {
    console.error(`Erro: pasta não encontrada: ${carrosselPath}`);
    process.exit(1);
  }

  // Lista PNGs na pasta, ordenados por nome
  const slides = fs.readdirSync(carrosselPath)
    .filter((f) => f.endsWith('.png'))
    .sort()
    .map((f) => path.join(carrosselPath, f));

  if (slides.length === 0) {
    console.error(`Nenhum arquivo PNG encontrado em: ${carrosselPath}`);
    process.exit(1);
  }

  console.log(`Enviando ${slides.length} slides para o Telegram...`);

  for (let i = 0; i < slides.length; i++) {
    const slidePath = slides[i];
    const fileSize = fs.statSync(slidePath).size;
    const slideLabel = `${i + 1}/${slides.length}`;

    process.stdout.write(`Enviando slide ${slideLabel}...`);

    try {
      if (fileSize > 10 * 1024 * 1024) {
        // Arquivo grande: envia como documento
        await enviarDocumento(token, chatId, slidePath);
        console.log(` enviado como documento (${Math.round(fileSize / 1024 / 1024)}MB)`);
      } else {
        await enviarFoto(token, chatId, slidePath);
        console.log(' enviado.');
      }
    } catch (err) {
      console.error(`\nErro no slide ${slideLabel}: ${err.message}`);

      if (err.message.includes('403')) {
        console.error('Dica: o bot precisa ter recebido uma mensagem sua primeiro. Mande "oi" para ele no Telegram e tente novamente.');
      }

      process.exit(1);
    }
  }

  console.log(`\nCarrossel entregue — ${slides.length} slides enviados com sucesso.`);
}

main().catch((err) => {
  console.error('Erro inesperado:', err.message);
  process.exit(1);
});
