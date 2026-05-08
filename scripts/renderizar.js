/**
 * renderizar.js — Converte um arquivo HTML em PNG 1080x1350
 *
 * Uso:
 *   node scripts/renderizar.js <caminho-do-html> <caminho-de-saida.png>
 *
 * Exemplo:
 *   node scripts/renderizar.js output/temp/carrossel-produtividade/slide-01.html output/carrossel-produtividade/slide-01.png
 *
 * Foto de perfil:
 *   Se o HTML contiver o placeholder __FOTO_PERFIL__, o script injeta automaticamente
 *   a imagem de marca/foto.jpg (ou .png / .jpeg) como base64 antes de renderizar.
 *
 * Imagens locais:
 *   Qualquer imagem local referenciada em <img src="..."> ou CSS url(...) também é
 *   convertida para base64 em memória. O HTML fonte não é alterado.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { pathToFileURL } = require('url');

// Verifica argumentos
const [,, htmlPath, outputPath] = process.argv;

if (!htmlPath || !outputPath) {
  console.error('Erro: argumentos obrigatórios ausentes.');
  console.error('Uso: node scripts/renderizar.js <html> <saida.png>');
  process.exit(1);
}

if (!fs.existsSync(htmlPath)) {
  console.error(`Erro: arquivo HTML não encontrado: ${htmlPath}`);
  process.exit(1);
}

// Cria o diretório de saída se não existir
const outputDir = path.dirname(outputPath);
fs.mkdirSync(outputDir, { recursive: true });
const userDataDir = path.join(os.tmpdir(), 'maquina-de-posts-puppeteer-profile');
const browserHome = path.join(os.tmpdir(), 'maquina-de-posts-browser-home');

// Procura a foto de perfil em marca/ (aceita .jpg, .jpeg ou .png)
function carregarFotoPerfil() {
  const raiz = path.join(__dirname, '..');
  const candidatos = ['marca/foto.jpg', 'marca/foto.jpeg', 'marca/foto.png'];

  for (const candidato of candidatos) {
    const fotoPath = path.join(raiz, candidato);
    if (fs.existsSync(fotoPath)) {
      const ext = path.extname(candidato).replace('.', '');
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
      const base64 = fs.readFileSync(fotoPath).toString('base64');
      return `data:${mime};base64,${base64}`;
    }
  }

  return null;
}

// Injeta a foto de perfil no HTML, substituindo o placeholder __FOTO_PERFIL__
function injetarFoto(html) {
  if (!html.includes('__FOTO_PERFIL__')) return html;

  const dataUrl = carregarFotoPerfil();

  if (dataUrl) {
    return html.replaceAll('__FOTO_PERFIL__', dataUrl);
  }

  // Foto não encontrada: remove o elemento que usa o placeholder para não quebrar o layout
  // Substitui por um círculo vazio com a cor de destaque da marca como fallback
  return html.replaceAll('__FOTO_PERFIL__', '');
}

function mimePorExtensao(arquivo) {
  const ext = path.extname(arquivo).toLowerCase();
  const mimes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  return mimes[ext] || 'application/octet-stream';
}

function ehImagemSuportada(arquivo) {
  return ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(path.extname(arquivo).toLowerCase());
}

function deveIgnorarUrl(valor) {
  if (!valor) return true;
  const url = valor.trim();
  return (
    url === '' ||
    url.startsWith('#') ||
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('//')
  );
}

function limparUrlLocal(valor) {
  const semAspas = valor.trim().replace(/^['"]|['"]$/g, '');
  const semQuery = semAspas.split('#')[0].split('?')[0];
  if (semQuery.startsWith('file://')) {
    try {
      return new URL(semQuery).pathname;
    } catch {
      return semQuery.replace(/^file:\/\//, '');
    }
  }
  try {
    return decodeURIComponent(semQuery);
  } catch {
    return semQuery;
  }
}

function resolverImagemLocal(valor, htmlAbsPath) {
  if (deveIgnorarUrl(valor)) return null;

  const local = limparUrlLocal(valor);
  if (!local) return null;

  const raiz = path.resolve(__dirname, '..');
  const htmlDir = path.dirname(htmlAbsPath);
  const candidatos = [];

  if (path.isAbsolute(local)) {
    candidatos.push(local);
    candidatos.push(path.resolve(raiz, `.${local}`));
  } else {
    candidatos.push(
      path.resolve(htmlDir, local),
      path.resolve(raiz, local),
      path.resolve(process.cwd(), local)
    );
  }

  return candidatos.find((candidato) => {
    return fs.existsSync(candidato) && fs.statSync(candidato).isFile() && ehImagemSuportada(candidato);
  }) || null;
}

function imagemParaDataUrl(arquivo) {
  const mime = mimePorExtensao(arquivo);
  const base64 = fs.readFileSync(arquivo).toString('base64');
  return `data:${mime};base64,${base64}`;
}

function injetarImagensLocais(html, htmlAbsPath) {
  const cache = new Map();

  function converter(valor) {
    if (deveIgnorarUrl(valor)) return valor;

    const arquivo = resolverImagemLocal(valor, htmlAbsPath);
    if (!arquivo) return valor;

    if (!cache.has(arquivo)) {
      cache.set(arquivo, imagemParaDataUrl(arquivo));
    }

    return cache.get(arquivo);
  }

  let resultado = html.replace(/\bsrc=(["'])([^"']+)\1/gi, (match, aspas, valor) => {
    const convertido = converter(valor);
    return `src=${aspas}${convertido}${aspas}`;
  });

  resultado = resultado.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi, (match, aspas, valor) => {
    const convertido = converter(valor);
    const quote = aspas || '"';
    return `url(${quote}${convertido}${quote})`;
  });

  return resultado;
}

async function renderizar() {
  let puppeteer;

  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    console.error('Erro: Puppeteer não está instalado.');
    console.error('Execute: npm install');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir,
    env: { ...process.env, HOME: browserHome, XDG_CONFIG_HOME: browserHome },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-crash-reporter', '--disable-crashpad', '--disable-features=Crashpad'],
  });

  try {
    const page = await browser.newPage();

    // Viewport exato 1080x1350 (ratio 4:5 nativo do Instagram)
    await page.setViewport({
      width: 1080,
      height: 1350,
      deviceScaleFactor: 1,
    });

    // Lê o HTML e injeta imagens somente em memória.
    const htmlBruto = fs.readFileSync(htmlPath, 'utf-8');
    const htmlAbsPath = path.resolve(htmlPath);
    const html = injetarImagensLocais(injetarFoto(htmlBruto), htmlAbsPath);

    const baseUrl = pathToFileURL(path.dirname(htmlAbsPath) + path.sep).href;
    const htmlComBase = html.replace(/<head([^>]*)>/i, `<head$1><base href="${baseUrl}">`);
    await page.setContent(htmlComBase, { waitUntil: 'networkidle0' });

    // Aguarda carregamento de fontes
    await page.evaluateHandle('document.fonts.ready');

    // Captura o screenshot com clip exato
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 1080, height: 1350 },
    });

    console.log(`Renderizado: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

renderizar().catch((err) => {
  console.error('Erro ao renderizar:', err.message);
  process.exit(1);
});
