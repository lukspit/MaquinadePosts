const fs = require('fs');
const path = require('path');
const https = require('https');

// Função simples para carregar variáveis de ambiente do config/.env
function carregarEnv() {
  const envPath = path.resolve(__dirname, '../config/.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let key = match[1];
        let value = match[2] ? match[2].trim() : '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
  }
}

async function baixarImagem(url, caminhoDestino) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(caminhoDestino);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return baixarImagem(response.headers.location, caminhoDestino).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(caminhoDestino, () => {});
      reject(err);
    });
  });
}

async function gerarImagemFal(prompt, caminhoSaida) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.log(`⚠️ FAL_KEY não configurada no .env.`);
    console.log(`➡️ Usando fallback gratuito (Pollinations.ai) para ${path.basename(caminhoSaida)}...`);
    return gerarImagemPollinations(prompt, caminhoSaida);
  }

  const model = process.env.FAL_MODEL || 'fal-ai/flux-2/klein/9b';
  console.log(`🌟 Gerando imagem PREMIUM via Fal.ai (${model}) para: ${path.basename(caminhoSaida)}...`);

  try {
    const url = `https://fal.run/${model}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        image_size: {
          width: 1080,
          height: 1350
        },
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
        output_format: 'png'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro na API do Fal.ai (Status ${response.status}): ${errorText}`);
      console.log(`➡️ Tentando fallback gratuito (Pollinations.ai)...`);
      return gerarImagemPollinations(prompt, caminhoSaida);
    }

    const data = await response.json();
    const imageUrl = data.images && data.images[0] && data.images[0].url;
    if (!imageUrl) {
      throw new Error('Resposta da Fal.ai sem URL de imagem.');
    }
    await baixarImagem(imageUrl, caminhoSaida);
    console.log(`✅ Imagem PREMIUM salva: ${caminhoSaida}`);
    
  } catch (error) {
    console.error(`❌ Erro fatal ao tentar gerar imagem na Fal.ai para ${caminhoSaida}:`, error.message);
    console.log(`➡️ Tentando fallback gratuito (Pollinations.ai)...`);
    return gerarImagemPollinations(prompt, caminhoSaida);
  }
}

async function gerarImagemPollinations(prompt, caminhoSaida) {
  try {
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt);
    // Url do Pollinations (gratuito) usando modelo flux
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1350&nologo=true&model=flux&seed=${seed}`;
    
    await baixarImagem(url, caminhoSaida);
    console.log(`⚠️ Imagem Gratuita salva (Pollinations): ${caminhoSaida}`);
  } catch (error) {
    console.error(`Erro ao baixar imagem da Pollinations para ${caminhoSaida}:`, error.message);
  }
}

async function main() {
  carregarEnv();

  const jsonPath = process.argv[2];
  const outputDir = process.argv[3];

  if (!jsonPath || !outputDir) {
    console.error("Uso: node scripts/gerar-imagens-carrossel.js <caminho-prompts.json> <pasta-saida-imagens>");
    process.exit(1);
  }

  if (!fs.existsSync(jsonPath)) {
    console.error(`Erro: Arquivo JSON não encontrado: ${jsonPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const prompts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  for (const item of prompts) {
    const caminhoSaida = path.join(outputDir, item.nomeArquivo);
    if (!fs.existsSync(caminhoSaida)) {
      await gerarImagemFal(item.prompt, caminhoSaida);
    } else {
      console.log(`Pulando ${item.nomeArquivo} (já existe).`);
    }
  }

  console.log("Processamento de imagens finalizado!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
