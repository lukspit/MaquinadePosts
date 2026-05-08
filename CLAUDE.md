# Máquina de Posts — Manifesto e Manual de Operacao

Leia este arquivo no inicio de cada sessao. Ele define a visao do produto, a metodologia de criacao e os limites do agente.

---

## 1. Visao

A Máquina de Posts e um sistema automatico de conteudo visual para Instagram. A promessa nao e "gerar slides"; e transformar uma ideia solta em uma peca pronta para publicar, com narrativa, direcao de arte, imagens e identidade de marca.

- **Objetivo:** parar o scroll, sustentar a atencao e levar a uma acao clara.
- **Padrao:** autoridade visual, limpeza, ritmo e especificidade.
- **Proibido:** emojis, visual poluido, texto pequeno, CTA generica e slides que parecem posts separados.
- **Assinatura:** se existir `marca/foto.*`, use `src="__FOTO_PERFIL__"` no slide 1 e no ultimo slide.

---

## 2. Fontes de Inteligencia

Antes de criar, leia:

1. `marca/perfil.md`
2. `marca/sistema-visual.css`
3. `pesquisa/instagram-framework.md`
4. `AGENTS.md`

Use esses arquivos como contexto e criterio de decisao. Nao transforme diretrizes em formulas rigidas.

---

## 3. Metodologia

Todo carrossel precisa nascer de uma tese. Antes de desenhar, defina:

- **Publico:** para quem isso existe.
- **Tensao:** qual dor, desejo, erro ou contradicao abre o loop.
- **Promessa:** o que a pessoa ganha se deslizar ate o final.
- **Arco:** como cada slide ganha o proximo.
- **CTA:** qual acao unica fecha naturalmente a narrativa.

O agente deve decidir a quantidade de slides com base no conteudo. O padrao e 6 a 9 slides.

---

## 4. Rotas Visuais

A rota e definida pela presenca de `FAL_KEY` em `config/.env`.

### Rota A: Imagem Premium

Use quando `FAL_KEY` tiver valor. O modelo padrao e `fal-ai/flux-2/klein/9b`.

- A imagem e a arte principal, nao decoracao.
- Use fotografia cinematica ou cenas conceituais realistas.
- Varie composicoes: Hero Fade, Split Lateral, Split Horizontal e Detalhe Editorial.
- Texto sobre foto sempre precisa de overlay escuro ou bloco solido.
- Nao coloque glow, textura ou SVG por cima de foto.

### Rota B: Tipografica

Use quando `FAL_KEY` estiver vazio ou quando o conteudo pedir respiro.

- Tipografia grande, contraste forte e hierarquia simples.
- Use textura sutil, grid, dots, linhas e acentos geometricos.
- Use formas minimalistas para representar conceitos, sem ilustrações complexas.

---

## 5. Pacing

Um bom carrossel alterna densidade e respiro.

- Slide 1: impacto imediato.
- Slide 2: segundo hook independente.
- Meio: alternar prova, insight, exemplo e respiro visual.
- Penultimo: consolidar a virada ou o maior aprendizado.
- Ultimo: CTA unica, limpa e facil de executar.

---

## 6. Producao

1. Leia contexto de marca e pesquisa.
2. Planeje tese, arco, pacing e rota visual.
3. Se usar imagens, gere `prompts.json` e rode `scripts/gerar-imagens-carrossel.js`.
4. Crie HTMLs em `output/carrossel-[slug]/`.
5. Renderize com `scripts/renderizar.js`.
6. Verifique se os PNGs existem, estao legiveis e seguem 1080x1350.

Comandos principais:

- `/começar`: setup e onboarding.
- `/carrossel [tema]`: gera carrossel.
- `/marca`: atualiza identidade.
- `/entregar`: envia PNGs pelo Telegram.
