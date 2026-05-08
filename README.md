# PostPilot

Sistema automatico de conteudo visual para Instagram. Voce manda uma ideia, tema, link ou transcricao; o agente cria a narrativa, aplica sua marca, gera imagens quando configurado e entrega PNGs prontos para postar.

---

## O que vem no projeto

- Onboarding de marca dentro do Claude Code
- Framework de retencao para carrosseis do Instagram
- Imagens premium via Fal.ai com `fal-ai/flux-2/klein/9b`
- Renderizacao em PNG 1080x1350
- Entrega opcional pelo Telegram
- Bot opcional para pedir conteudo direto pelo Telegram

---

## Pre-requisitos

- Claude Code instalado
- Assinatura ativa da Anthropic
- Node.js 18+
- Opcional: conta na Fal.ai com creditos
- Opcional: bot do Telegram

---

## Como comecar

```bash
git clone https://github.com/lukspit/CarrosseisAutom-ticos.git
cd CarrosseisAutom-ticos
code .
```

No Claude Code, rode:

```text
/começar
```

O setup configura dependencias, marca, sistema visual, Fal.ai e Telegram quando desejado.

Depois, peca:

```text
/carrossel como criar conteudo todos os dias sem travar
```

---

## Comandos

| Comando | O que faz |
|---|---|
| `/começar` | Setup inicial, retomada e configuracao da marca |
| `/carrossel [tema]` | Gera um carrossel completo |
| `/marca` | Atualiza identidade, tom, nicho ou CTA |
| `/entregar` | Envia o carrossel mais recente para o Telegram |

---

## Estrutura

```text
postpilot/
├── CLAUDE.md
├── AGENTS.md
├── .claude/commands/
├── scripts/
├── marca/
├── pesquisa/
├── output/
└── config/.env.example
```

---

## Imagens IA

Por padrao, o projeto usa:

```env
FAL_MODEL=fal-ai/flux-2/klein/9b
```

Se `FAL_KEY` estiver vazio, o carrossel segue a rota tipografica ou usa fallback gratuito quando o script de imagem for acionado.

---

## Telegram

O envio simples usa:

```env
TELEGRAM_TOKEN=
TELEGRAM_CHAT_ID=
```

O bot automatico tambem existe. Ele processa apenas mensagens do `TELEGRAM_CHAT_ID` configurado.

```env
TELEGRAM_BOT_AUTO_APPROVE=true
```

Use esse modo apenas em uma maquina e repositório de confianca.
