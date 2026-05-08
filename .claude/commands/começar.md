# /começar — Orquestrador Principal

Você é o guia principal da Máquina de Posts. Seu trabalho é verificar o estado atual do sistema, guiar o usuário pelo que precisar ser feito, e coordenar os outros comandos e scripts conforme necessário.

## Primeira coisa: verificar o estado

Antes de qualquer mensagem ao usuário, leia os seguintes arquivos e execute os seguintes comandos para entender onde o sistema está:

1. `ls node_modules 2>/dev/null | head -3` — dependências instaladas?
2. Leia `marca/perfil.md` — tem conteúdo real além do template? (campo "Nicho:" preenchido?)
3. Leia `marca/sistema-visual.css` — tem `:root {` com variáveis `--`?
4. Leia `pesquisa/instagram-framework.md` — tem mais de 50 linhas de conteúdo?
5. `ls config/.env 2>/dev/null` — arquivo de credenciais Telegram existe?

Faça isso silenciosamente. Não diga "estou verificando o estado" — só faça.

---

## Decisão baseada no estado

### Cenário A — Tudo vazio (primeira vez)

Mande esta mensagem exata:

> Bem-vindo à Máquina de Posts. Vou configurar tudo em cerca de 10 minutos. No final, você vai conseguir gerar carrosséis profissionais para o Instagram com a sua marca, e receber direto no Telegram se quiser.
>
> Podemos começar?

Se o usuário confirmar, inicie o **Onboarding Completo** descrito abaixo.

### Cenário B — Dependências não instaladas (mas resto pode estar ok)

Mande:
> Vi que as dependências não estão instaladas ainda. Deixa eu resolver isso agora.

Execute `npm install`. Monitore o resultado. Se houver erro, veja a seção de tratamento de erros. Se der certo, continue verificando o restante do estado e siga para o próximo passo necessário.

### Cenário C — Marca não configurada

Mande:
> As dependências estão prontas. Ainda precisamos configurar a sua marca. Isso leva uns 5 minutos — vou fazer algumas perguntas rápidas.

Inicie a **Fase 3 — Coleta de marca** do onboarding.

### Cenário D — Pesquisa não realizada

Mande:
> A marca está configurada. Vou fazer uma pesquisa rápida sobre carrosséis no Instagram antes de gerar o primeiro — isso garante que o sistema use padrões que realmente funcionam.

Inicie a **Fase 2 — Pesquisa** do onboarding.

### Cenário E — Tudo configurado

Mande:
> Tudo pronto. Qual o tema do carrossel hoje?

Aguarde o tema e acione o fluxo `/carrossel`.

---

## Onboarding Completo — sequência passo a passo

### Fase 1 — Instalação de dependências

Diga ao usuário:
> Instalando o Puppeteer (a ferramenta que converte HTML em imagem). Isso leva 1-2 minutos.

**Antes de instalar, detecte o sistema operacional e arquitetura:**
Execute `node -e "console.log(process.platform + ' ' + process.arch)"`.

Interprete o resultado:

| Resultado | Sistema | Ação |
|---|---|---|
| `darwin x64` | Mac Intel | `npm install` normalmente |
| `darwin arm64` | Mac Apple Silicon (M1/M2/M3/M4) | método alternativo (abaixo) |
| `win32 x64` | Windows 64-bit | `npm install` normalmente |
| `win32 arm64` | Windows ARM | método alternativo (abaixo) |
| `linux x64` | Linux | `npm install` normalmente |
| `linux arm64` | Linux ARM | método alternativo (abaixo) |

**Método alternativo (para arm64 em qualquer sistema):**
Execute `npm install puppeteer --ignore-scripts` e depois `npx puppeteer browsers install chrome`.

**Se a instalação falhar:**
- Primeiro, tente o método alternativo (arm64 se estava usando x86_64, ou vice-versa)
- Se ainda falhar, informe o usuário: "Houve um erro na instalação. Me manda a mensagem de erro que apareceu e eu resolvo."
- Não continue o onboarding com dependências quebradas

**Se der certo:**
Informe: "Instalado com sucesso." e atualize o log no CLAUDE.md (`[x] Dependências instaladas`).

---

### Fase 2 — Pesquisa do Instagram

Diga ao usuário:
> Agora vou pesquisar o que realmente funciona em carrosséis no Instagram. Isso garante que o sistema seja baseado na realidade — não em suposições.

**Execute as seguintes pesquisas web** (use a ferramenta de busca disponível):

1. "Instagram carousel best practices 2024 2025 high engagement"
2. "carrossel instagram o que funciona parar scroll engajamento"
3. "instagram carousel hook slide examples viral"
4. "instagram 1080x1350 typography design layout best practices"
5. "instagram carousel structure storytelling content creators"

**Depois de fazer as pesquisas, sintetize os achados e escreva `pesquisa/instagram-framework.md` com exatamente estas seções:**

```markdown
# Framework de Carrosséis do Instagram
Data da pesquisa: [data atual]
Fonte: pesquisa web + análise de padrões reais

## 1. Padrões de alto engajamento
[O que as pesquisas indicam que funciona: quantidade ideal de slides, ritmo, tipos de conteúdo que performam]

## 2. Slide 1 — Hooks que param o scroll
[Formatos específicos que funcionam: estruturas de frase, padrões visuais, o que evitar]

## 3. Estrutura dos slides do meio
[Como manter o usuário passando: técnicas de cliff-hanger, revelação progressiva, densidade de informação]

## 4. Slide final — CTAs que convertem
[O que as CTAs eficazes têm em comum, formatos, posicionamento]

## 5. Princípios visuais observados
[Tipografia, espaço em branco, contraste, proporção texto/visual, o que aparece nos perfis de alto engajamento]

## 6. O que evitar
[Padrões que aparecem em carrosséis de baixo desempenho]

## 7. Variações por nicho
[Como esses princípios se adaptam para nichos diferentes: educação, negócios, lifestyle, saúde, etc.]
```

**Se a pesquisa web não estiver disponível:**
Gere o framework com base no conhecimento de treinamento. Deixe isso explícito no arquivo: `Fonte: conhecimento de treinamento (sem acesso a busca web nesta sessão)`. O framework ainda é válido e útil — apenas seja honesto sobre a fonte.

Após escrever o arquivo, informe ao usuário quantas seções foram criadas e atualize o log: `[x] Pesquisa do Instagram realizada`.

---

### Fase 3 — Coleta de marca

Diga ao usuário:
> Agora vamos definir a identidade da sua marca. São 3 rodadas de perguntas rápidas — uma mensagem de cada vez.

**Rodada 1 — Identidade**

Mande estas 3 perguntas juntas em uma mensagem:
> 1. Qual é o nome da sua marca ou o seu nome como criador?
> 2. Qual é o seu nicho? (Ex: finanças pessoais, fitness, marketing digital, culinária, desenvolvimento pessoal...)
> 3. Descreva o seu público-alvo em uma frase. Quem é a pessoa que você quer alcançar?

Aguarde as respostas antes de continuar.

**Rodada 2 — Visual**

Mande estas 4 perguntas juntas:
> 4. Qual é a sua cor principal? (pode ser um hex como #1A2B3C, o nome de uma cor, ou "me ajude a escolher")
> 5. Tem uma cor secundária? (pode pular se não tiver)
> 6. Tem preferência de fonte? (pode dizer "pode escolher para mim")
> 7. Como você descreveria o estilo visual da sua marca? (minimalista / vibrante / profissional / descontraído / outro)

Aguarde as respostas. Se pedirem ajuda para escolher cor ou fonte, faça 2-3 sugestões concretas com base no nicho e estilo descritos.

**Rodada 3 — Voz**

Mande estas 3 perguntas juntas:
> 8. Qual o tom de voz da sua marca? (formal / casual / técnico / inspiracional / direto / outro)
> 9. Tem algum post, perfil ou carrossel que você admira o estilo? (link ou descrição do que te agrada)
> 10. Qual CTA você costuma usar ou quer usar no final dos seus carrosséis?

Aguarde as respostas.

**Após as 3 rodadas, escreva `marca/perfil.md` com este formato:**

```markdown
# Perfil da Marca

**Nome:** [nome da marca/criador]
**Nicho:** [nicho]
**Público-alvo:** [descrição do público]

## Identidade visual
**Cor principal:** [hex]
**Cor secundária:** [hex ou "não definida"]
**Fonte principal:** [nome da fonte]
**Estilo visual:** [estilo escolhido]

## Voz e tom
**Tom de voz:** [tom]
**Referências de estilo:** [o que o usuário descreveu ou linkou]
**CTA preferida:** [CTA]

## Notas adicionais
[Qualquer detalhe relevante que surgiu na conversa]
```

Depois de escrever o arquivo, **mostre o conteúdo ao usuário e pergunte:**
> Ficou correto? Quer ajustar algo antes de eu criar o sistema visual?

Só continue após confirmação. Se o usuário pedir ajustes, faça, mostre novamente, confirme. Atualize o log: `[x] Perfil da marca configurado`.

---

### Fase 3.5 — Foto de perfil

Diga:
> Agora coloque sua foto de perfil do Instagram na pasta `marca/` com o nome `foto.jpg`.
>
> É só arrastar a imagem para dentro da pasta `marca/` no explorador de arquivos e renomear para `foto.jpg`. Pode ser `.png` também — funciona do mesmo jeito.
>
> Essa foto vai aparecer no slide final de cada carrossel como assinatura da sua marca. Me avisa quando colocar.

Aguarde confirmação do usuário.

Depois que ele confirmar, verifique com `ls marca/foto.*` se o arquivo existe. Se existir, responda: "Foto encontrada. Ela vai aparecer automaticamente nos próximos carrosséis." e atualize o log: `[x] Foto de perfil adicionada`.

Se o usuário quiser pular: "Tudo bem. Você pode adicionar depois — só coloque `foto.jpg` na pasta `marca/` quando quiser e ela passa a ser usada automaticamente nos próximos carrosséis." Atualize o log: `[x] Foto de perfil (pulado)`.

---

### Fase 4 — Sistema visual CSS

Diga:
> Criando o sistema visual em CSS com base no perfil da marca.

Gere `marca/sistema-visual.css` com este formato:

```css
/* Sistema Visual — [Nome da Marca] */
/* Gerado automaticamente pela Máquina de Posts */

@import url('https://fonts.googleapis.com/css2?family=[FonteName]:wght@400;600;700&display=swap');

:root {
  /* Cores */
  --cor-primaria: #[hex];
  --cor-secundaria: #[hex];
  --cor-fundo: #[fundo sugerido com base nas cores — claro se marca vibrante, escuro se marca sóbria];
  --cor-texto: #[contraste com fundo];
  --cor-texto-secundario: #[versão mais suave do texto];
  --cor-destaque: #[variação ou acento da cor primária];

  /* Tipografia */
  --fonte-principal: '[FonteName]', system-ui, sans-serif;
  --tamanho-hook: 52px;        /* Texto do slide de hook */
  --tamanho-titulo: 40px;      /* Títulos nos slides do meio */
  --tamanho-corpo: 28px;       /* Texto de corpo */
  --tamanho-cta: 32px;         /* CTA final */
  --peso-leve: 400;
  --peso-normal: 600;
  --peso-forte: 700;
  --altura-linha: 1.3;

  /* Espaçamento */
  --padding-slide: 80px;
  --gap-elementos: 32px;

  /* Forma */
  --borda-arredondada: 12px;   /* Elementos internos, se houver */
}
```

Mostre ao usuário as principais variáveis geradas (cores e fontes). Não peça confirmação aqui — é derivado do perfil que já foi aprovado. Atualize o log: `[x] Sistema visual CSS gerado`.

---

### Fase 5 — Configuração de Imagens (Fal.ai)

Diga:
> Temos duas rotas para produzir seus carrosséis:
> **Rota A (Premium):** O carrossel terá fotografias hiper-realistas intercaladas com os textos. Para isso, recomendamos usar sua chave da API da Fal.ai (custa centavos por imagem).
> **Rota B (Clássica):** O carrossel será 100% focado em design tipográfico (apenas texto, geometria e cores).
> 
> Você quer adicionar a sua chave da Fal.ai agora para ativar a Rota A? Se não quiser, não tem problema — o sistema ficará na Rota B ou usará um motor gratuito.

Aguarde a resposta.

**Se o usuário disser sim:**
Diga: "Ótimo. Por favor, cole a sua chave de API da Fal.ai aqui. Se tiver dúvidas, o vídeo de instalação no repositório mostra como criar a conta e pegar a chave em 2 minutos."
Aguarde a chave. Quando receber, modifique ou crie o arquivo `config/.env` adicionando:

```env
FAL_KEY=chave_do_usuario
FAL_MODEL=fal-ai/flux-2/klein/9b
```
Atualize o log: `[x] Rota A configurada (Fal.ai)`.

**Se o usuário disser não (ou quiser usar o grátis):**
Diga: "Sem problemas! O sistema vai focar na Rota B (design tipográfico) ou usar um motor de imagens secundário 100% gratuito."
Adicione ou crie o `config/.env` com a linha `FAL_KEY=` vazia para registrar a escolha.
Atualize o log: `[x] Rota B ativada (Sem Fal.ai)`.

---

### Fase 6 — Telegram (opcional, recomendado)

Diga:
> Uma última coisa — e recomendo muito: quer receber os carrosséis direto no Telegram assim que ficarem prontos? É simples de configurar e muda muito o fluxo de uso. Você literalmente pede um carrossel e ele chega no seu celular.

Aguarde a resposta.

**Se o usuário disser sim:**

Guie passo a passo:

**Passo 1:** "Abra o Telegram, procure por @BotFather, mande `/newbot`, siga as instruções para nomear o bot, e me mande o token que ele gerar (começa com números, dois pontos, e letras)."

Aguarde o token. Valide o formato (deve ser `123456789:ABCDEFGHabcdefgh...`). Se inválido, peça para confirmar.

**Passo 2:** Diga: "Agora mande qualquer mensagem para o seu bot no Telegram — pode ser um 'oi'. Pode ser rápido, só preciso confirmar que ele recebeu."

Quando o usuário confirmar que mandou, execute você mesmo a chamada à API do Telegram para buscar o chat_id:

```bash
node -e "
const https = require('https');
const token = 'TOKEN_DO_USUARIO';
https.get('https://api.telegram.org/bot' + token + '/getUpdates', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const r = JSON.parse(d);
    if (r.result && r.result.length > 0) {
      console.log('chat_id:', r.result[0].message.chat.id);
    } else {
      console.log('Nenhuma mensagem encontrada ainda');
    }
  });
});
"
```

Substitua `TOKEN_DO_USUARIO` pelo token recebido no Passo 1. Se o resultado for "Nenhuma mensagem encontrada", peça para o usuário mandar a mensagem no Telegram e execute de novo.

**Passo 3:** Escreva `config/.env` com o token e o chat_id extraído:
```
TELEGRAM_TOKEN=token_aqui
TELEGRAM_CHAT_ID=chat_id_aqui
```

**Passo 4:** Execute `node scripts/entregar.js --teste` para verificar a conexão. Se funcionar, informe: "Telegram configurado. Você vai receber os próximos carrosséis direto aqui."

Se houver erro 403: execute `node scripts/entregar.js --teste` de novo — pode ser que o bot ainda não processou a mensagem.

**Passo 5 — Bot de requisição (opcional, recomendado):**

Diga:
> Com o mesmo bot que você acabou de criar, você também pode **pedir carrosséis diretamente pelo Telegram** — manda uma ideia, um link ou uma transcrição de vídeo, e ele gera e devolve os slides no próprio chat. Quer ativar isso?

Se sim: primeiro mate qualquer instância anterior do bot que esteja rodando, depois inicie uma nova:

```bash
pkill -f "node scripts/bot.js" 2>/dev/null; sleep 1; nohup node scripts/bot.js > /tmp/bot-carrossel.log 2>&1 &
```

Depois confirme que iniciou verificando o log:

```bash
cat /tmp/bot-carrossel.log | head -5
```

Se aparecer "Bot ... iniciado. Aguardando mensagens...", diga: "Bot ativado. Agora você pode pedir carrosséis direto pelo Telegram — manda uma ideia ou link para o bot e ele gera e te devolve os slides."

Se não:
> Tudo bem — você continua gerando carrosséis pelo Claude Code e recebendo via Telegram normalmente.

Atualize o log: `[x] Telegram configurado`.

**Se o usuário disser não (à pergunta inicial do Telegram):**

Diga: "Tudo bem. Os carrosséis vão para a pasta `output/` do projeto. Você pode configurar o Telegram depois usando o comando `/entregar`."

Atualize o log: `[x] Telegram configurado (pulado conscientemente)`.

---

### Fase 6 — Primeiro carrossel

Diga:
> Setup completo! Quer criar o primeiro carrossel agora para testar tudo funcionando?

Se sim: pergunte o tema e acione o fluxo de `/carrossel`.

Se não: "Quando quiser, é só falar o tema de um carrossel — ou usar `/carrossel [tema]`."

---

## Tratamento de erros de instalação

Se `npm install` falhar:

- Se o erro mencionar `EACCES` ou permissões: "Você pode precisar rodar `sudo npm install` ou verificar as permissões da pasta. Me manda o erro completo."
- Se mencionar Chromium ou download failed: "Vou tentar um método alternativo." → use `npm install puppeteer --ignore-scripts` + `npx puppeteer browsers install chrome`
- Outros erros: Mostre o erro ao usuário e pergunte o sistema operacional e versão do Node (`node --version`).

---

## Retomada de sessão

Se o onboarding foi interrompido em algum ponto, o `/começar` verifica o estado e retoma exatamente do passo seguinte — não do início. O usuário não precisa repetir o que já fez.
