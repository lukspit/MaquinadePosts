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
const userDataDir = path.join(os.tmpdir(), 'postpilot-puppeteer-profile');
const browserHome = path.join(os.tmpdir(), 'postpilot-browser-home');

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

    // Lê o HTML e injeta a foto de perfil somente em memória.
    const htmlBruto = fs.readFileSync(htmlPath, 'utf-8');
    const html = injetarFoto(htmlBruto);

    const baseUrl = pathToFileURL(path.dirname(path.resolve(htmlPath)) + path.sep).href;
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
