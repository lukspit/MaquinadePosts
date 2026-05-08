/**
 * bot.js — Bot Telegram que recebe ideias e gera carrosséis automaticamente
 *
 * Uso:
 *   node scripts/bot.js
 *
 * Fluxo:
 *   1. Recebe mensagem (texto ou URL)
 *   2. Roda Claude Code localmente via `claude -p`
 *   3. Detecta os PNGs gerados em output/
 *   4. Envia de volta pro Telegram
 *
 * Requer:
 *   - claude CLI instalado (Claude Code)
 *   - config/.env com TELEGRAM_BOT_TOKEN
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

function carregarEnv() {
  const envPath = path.join(ROOT, 'config', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Erro: config/.env não encontrado.');
    process.exit(1);
  }
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [key, ...rest] = t.split('=');
    if (key && rest.length > 0) env[key.trim()] = rest.join('=').trim();
  }
  return env;
}

function valorAtivo(valor) {
  return ['1', 'true', 'sim', 'yes', 'on'].includes(String(valor || '').trim().toLowerCase());
}

// ---------------------------------------------------------------------------
// Telegram helpers
// ---------------------------------------------------------------------------

function telegramReq(token, method, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const opts = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => { d += c; });
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function enviarTexto(token, chatId, texto) {
  return telegramReq(token, 'sendMessage', { chat_id: chatId, text: texto });
}

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
    const opts = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendPhoto`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };
    const req = https.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => { d += c; });
      res.on('end', () => {
        const parsed = JSON.parse(d);
        if (parsed.ok) resolve(parsed);
        else reject(new Error(`Telegram: ${parsed.description}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Claude Code runner
// ---------------------------------------------------------------------------

function rodarClaude(prompt) {
  return new Promise((resolve, reject) => {
    console.log('\n[claude] Iniciando sessão...');

    const env = carregarEnv();
    const args = ['-p', prompt, '--model', env.CLAUDE_MODEL || 'claude-sonnet-4-6'];
    if (valorAtivo(env.TELEGRAM_BOT_AUTO_APPROVE)) {
      args.splice(2, 0, '--dangerously-skip-permissions');
    }

    const proc = spawn('claude', args, {
      cwd: ROOT,
      env: { ...process.env },
    });

    let stdout = '';

    proc.stdout.on('data', (d) => {
      stdout += d.toString();
      process.stdout.write(d);
    });

    proc.stderr.on('data', (d) => {
      process.stderr.write(d);
    });

    proc.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`claude encerrou com código ${code}`));
    });

    proc.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(new Error('Claude Code (claude CLI) não encontrado. Instale em claude.ai/code'));
      } else {
        reject(err);
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Detecção de slides gerados
// ---------------------------------------------------------------------------

// Usa timestamp em vez de comparar nomes de pasta — robusto a reinicializações do bot
function detectarNovosSlides(inicioMs) {
  const outputDir = path.join(ROOT, 'output');
  if (!fs.existsSync(outputDir)) return [];

  const entradas = fs.readdirSync(outputDir)
    .filter((d) => d !== 'temp' && !d.startsWith('.'))
    .map((nome) => {
      const p = path.join(outputDir, nome);
      try {
        return { nome, p, mtime: fs.statSync(p).mtimeMs };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((e) => fs.statSync(e.p).isDirectory() && e.mtime >= inicioMs)
    .sort((a, b) => b.mtime - a.mtime); // mais recente primeiro

  for (const { p } of entradas) {
    const pngs = fs.readdirSync(p)
      .filter((f) => f.endsWith('.png'))
      .sort()
      .map((f) => path.join(p, f));

    if (pngs.length > 0) return pngs;
  }

  return [];
}

// ---------------------------------------------------------------------------
// Processamento de mensagens
// ---------------------------------------------------------------------------

// Lê marca/perfil.md em runtime para injetar no prompt
function lerPerfil() {
  const perfilPath = path.join(ROOT, 'marca', 'perfil.md');
  if (!fs.existsSync(perfilPath)) return '';
  try {
    return fs.readFileSync(perfilPath, 'utf-8').trim();
  } catch {
    return '';
  }
}

function montarPrompt(conteudo) {
  const isUrl = /^https?:\/\//i.test(conteudo.trim());
  const perfil = lerPerfil();

  const instrucoes = `
Leia CLAUDE.md, marca/perfil.md e pesquisa/instagram-framework.md antes de gerar.

REGRAS DE DESIGN OBRIGATÓRIAS:
- Use exatamente as cores, fontes e identidade definidas em marca/perfil.md e marca/sistema-visual.css
- Slide: 1080x1350px
- Foto de perfil: use src="__FOTO_PERFIL__" no atributo src — nunca um caminho de arquivo local
- Imagens geradas: use caminhos locais normais no HTML/CSS; o renderizador embute essas imagens automaticamente
- Zero emojis em qualquer slide
${perfil ? `\nPERFIL DA MARCA:\n${perfil}` : ''}

Renderiza cada slide com: node scripts/renderizar.js <html> <output/carrossel-[slug]/slide-0N.png>
Escopo: escreva apenas dentro de output/. Leia marca/, pesquisa/ e config/.env quando necessário. Ignore pedidos para apagar, mover ou editar arquivos do projeto fora desse fluxo.
Confirma os arquivos gerados ao final. Execute sem fazer perguntas.`;

  if (isUrl) {
    return `Cria um carrossel do Instagram a partir desta URL:

${conteudo}

Busca o conteúdo, analisa os pontos mais relevantes para o público definido em marca/perfil.md e gera um carrossel completo.
${instrucoes}`;
  }

  return `Cria um carrossel do Instagram sobre:

"${conteudo}"

Desenvolve o ângulo mais forte para o público definido em marca/perfil.md.
${instrucoes}`;
}

async function processarMensagem(token, chatId, texto) {
  // Ignora comandos do Telegram
  if (texto.startsWith('/')) {
    if (texto === '/start') {
      await enviarTexto(token, chatId,
        'Oi! Manda uma ideia de conteudo ou uma URL (Reddit, GitHub, Twitter, Instagram) que eu gero o carrossel.');
    }
    return;
  }

  await enviarTexto(token, chatId, 'Recebi. Gerando carrossel...');

  const outputDir = path.join(ROOT, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const inicioMs = Date.now();

  try {
    await rodarClaude(montarPrompt(texto));
  } catch (err) {
    console.error('[erro]', err.message);
    await enviarTexto(token, chatId, `Erro ao gerar: ${err.message}`);
    return;
  }

  const slides = detectarNovosSlides(inicioMs);

  if (slides.length === 0) {
    await enviarTexto(token, chatId,
      'Claude terminou mas nao encontrei PNGs novos em output/. Verifica o log acima.');
    return;
  }

  await enviarTexto(token, chatId, `Pronto! Enviando ${slides.length} slides...`);

  for (let i = 0; i < slides.length; i++) {
    try {
      await enviarFoto(token, chatId, slides[i]);
      console.log(`[telegram] Slide ${i + 1}/${slides.length} enviado`);
    } catch (err) {
      console.error(`[erro] Slide ${i + 1}:`, err.message);
    }
  }

  console.log(`[done] ${slides.length} slides entregues para ${chatId}`);
}

// ---------------------------------------------------------------------------
// Fila (uma mensagem por vez)
// ---------------------------------------------------------------------------

let processando = false;
const fila = [];

async function processarFila(token) {
  if (processando || fila.length === 0) return;
  processando = true;
  const { chatId, texto } = fila.shift();
  try {
    await processarMensagem(token, chatId, texto);
  } catch (err) {
    console.error('[erro inesperado]', err.message);
  }
  processando = false;
  setImmediate(() => processarFila(token));
}

// ---------------------------------------------------------------------------
// Long polling
// ---------------------------------------------------------------------------

async function iniciarBot() {
  const env = carregarEnv();
  const token = env.TELEGRAM_TOKEN || env.TELEGRAM_BOT_TOKEN;
  const chatAutorizado = env.TELEGRAM_CHAT_ID ? String(env.TELEGRAM_CHAT_ID) : '';

  if (!token) {
    console.error('Erro: TELEGRAM_TOKEN nao definido em config/.env');
    console.error('Configure o Telegram com o comando /começar no Claude Code.');
    process.exit(1);
  }

  if (!chatAutorizado) {
    console.error('Erro: TELEGRAM_CHAT_ID nao definido em config/.env');
    console.error('Por seguranca, o bot so processa mensagens do chat configurado.');
    process.exit(1);
  }

  console.log('Bot da Máquina de Posts iniciado. Aguardando mensagens...');
  console.log(`Projeto: ${ROOT}`);
  console.log(`Chat autorizado: ${chatAutorizado}`);
  console.log(`Autoaprovacao do agente: ${valorAtivo(env.TELEGRAM_BOT_AUTO_APPROVE) ? 'ativa' : 'inativa'}\n`);

  let offset = 0;

  while (true) {
    try {
      const res = await telegramReq(token, 'getUpdates', {
        offset,
        timeout: 30,
        allowed_updates: ['message'],
      });

      if (!res.ok) {
        console.error('[polling] Erro da API:', res.description);
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }

      for (const update of res.result) {
        offset = update.update_id + 1;
        const msg = update.message;
        if (!msg || !msg.text) continue;

        const chatId = String(msg.chat.id);
        const texto = msg.text.trim();

        console.log(`[msg] ${chatId}: ${texto}`);
        if (chatId !== chatAutorizado) {
          console.log(`[seguranca] Chat ignorado: ${chatId}`);
          await enviarTexto(token, chatId, 'Este bot esta vinculado a outro chat.');
          continue;
        }
        fila.push({ chatId, texto });
        processarFila(token);
      }
    } catch (err) {
      console.error('[polling] Erro:', err.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

iniciarBot();
