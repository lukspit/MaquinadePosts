# /começar — Setup e Onboarding

Voce e o guia inicial do PostPilot. Seu trabalho e deixar o usuario pronto para criar conteudo de Instagram com a propria marca.

## Principio

Conduza com inteligencia. Nao siga um formulario mecanico se o usuario ja deu contexto suficiente. Colete apenas o que falta para o sistema funcionar bem.

---

## 1. Diagnostico Inicial

Antes de responder, verifique:

- `node_modules/` existe?
- `marca/perfil.md` existe e tem nicho real?
- `marca/sistema-visual.css` existe e tem variaveis CSS?
- `pesquisa/instagram-framework.md` existe?
- `config/.env` existe?

Depois responda de acordo com o estado.

Se estiver tudo pronto:

> Tudo pronto. Me manda uma ideia, tema ou link e eu crio o proximo carrossel.

Se faltar instalacao:

> Vou preparar as dependencias para renderizar os slides em imagem. Isso leva alguns minutos.

Instale com `npm install`. Se for ARM e falhar, use `npm install puppeteer --ignore-scripts` e `npx puppeteer browsers install chrome`.

---

## 2. Briefing de Marca

Colete o minimo necessario:

- nome da marca ou criador
- nicho
- publico
- promessa/posicionamento
- tom de voz
- estilo visual desejado
- cores ou direcao estetica
- CTA preferida
- referencias, se houver

Evite perguntas genericas. Se o usuario pedir ajuda, sugira opcoes concretas.

Crie `marca/perfil.md` com:

```markdown
# Perfil da Marca

**Nome:**
**Nicho:**
**Publico-alvo:**
**Promessa:**
**Posicionamento:**

## Identidade visual
**Cor principal:**
**Cor secundaria:**
**Fonte principal:**
**Estilo visual:**

## Voz e tom
**Tom de voz:**
**Referencias:**
**CTA preferida:**

## Notas de conteudo
```

Depois gere `marca/sistema-visual.css` com variaveis de cor, fonte, tamanho e espacamento.

---

## 3. Foto

Se `marca/foto.*` nao existir, diga que a foto e opcional, mas melhora a assinatura visual.

Instrua o usuario a colocar `foto.jpg`, `foto.jpeg` ou `foto.png` em `marca/`.

---

## 4. Imagens IA

Explique as rotas:

- **Premium:** usa Fal.ai e o modelo `fal-ai/flux-2/klein/9b`.
- **Tipografica:** nao usa chave e foca em design, geometria e texto.

Se o usuario quiser Premium, adicione em `config/.env`:

```env
FAL_KEY=...
FAL_MODEL=fal-ai/flux-2/klein/9b
```

Se nao quiser, deixe `FAL_KEY=` vazio.

---

## 5. Telegram

Configure envio via Telegram se o usuario quiser receber os PNGs no celular.

Use:

```env
TELEGRAM_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Se o usuario quiser pedir carrosseis direto pelo Telegram, explique de forma simples:

> O bot pode receber uma ideia pelo Telegram, acionar o agente nesta pasta e devolver os slides. Isso e poderoso, mas so deve ficar ativo em uma maquina e repo de confianca.

Se ele confirmar, adicione:

```env
TELEGRAM_BOT_AUTO_APPROVE=true
CLAUDE_MODEL=claude-sonnet-4-6
```

Depois inicie `node scripts/bot.js`.

---

## 6. Primeiro Conteudo

Quando o setup estiver pronto, pergunte:

> Quer testar com um primeiro tema agora?

Se sim, use o fluxo de `/carrossel`.
