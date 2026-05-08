/**
 * renderizar-banner.js — Converte um HTML em PNG com dimensões customizadas
 *
 * Uso:
 *   node scripts/renderizar-banner.js <html> <saida.png> <largura> <altura>
 *
 * Exemplo:
 *   node scripts/renderizar-banner.js output/banner-checkout/banner.html output/banner-checkout/banner.png 1200 400
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const [,, htmlPath, outputPath, wStr, hStr] = process.argv;

if (!htmlPath || !outputPath) {
  console.error('Uso: node scripts/renderizar-banner.js <html> <saida.png> [largura] [altura]');
  process.exit(1);
}

if (!fs.existsSync(htmlPath)) {
  console.error(`Arquivo HTML não encontrado: ${htmlPath}`);
  process.exit(1);
}

const WIDTH  = parseInt(wStr  || '1200', 10);
const HEIGHT = parseInt(hStr  || '400',  10);

const outputDir = path.dirname(outputPath);
fs.mkdirSync(outputDir, { recursive: true });
const userDataDir = path.join(os.tmpdir(), 'maquina-de-posts-puppeteer-profile');
const browserHome = path.join(os.tmpdir(), 'maquina-de-posts-browser-home');

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

function injetarFoto(html) {
  if (!html.includes('__FOTO_PERFIL__')) return html;
  const dataUrl = carregarFotoPerfil();
  if (dataUrl) return html.replaceAll('__FOTO_PERFIL__', dataUrl);
  return html.replaceAll('__FOTO_PERFIL__', '');
}

async function renderizar() {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    console.error('Puppeteer não instalado. Execute: npm install');
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

    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

    const htmlBruto = fs.readFileSync(htmlPath, 'utf-8');
    const html = injetarFoto(htmlBruto);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');

    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });

    console.log(`Renderizado: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

renderizar().catch((err) => {
  console.error('Erro:', err.message);
  process.exit(1);
});
