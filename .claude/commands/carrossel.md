# /carrossel — Criar Conteudo para Instagram

Use este comando para transformar um tema, ideia, link ou transcricao em um carrossel pronto para postar.

## Objetivo

Criar uma peca com narrativa forte, direcao de arte coerente, imagens quando fizer sentido e PNGs finais em `output/`.

---

## 1. Contexto

Leia:

- `CLAUDE.md`
- `AGENTS.md`
- `marca/perfil.md`
- `marca/sistema-visual.css`
- `pesquisa/instagram-framework.md`
- `config/.env` para decidir Rota A ou Rota B

Se faltar marca, acione mentalmente o fluxo de `/começar` e configure antes.

---

## 2. Planejamento

Defina internamente:

- tese central
- publico e dor/desejo
- hook
- arco dos slides
- pacing visual
- CTA unica
- quais slides usam imagem

Mostre ao usuario um plano curto apenas quando houver decisao criativa relevante. Se o pedido for simples, pode executar direto.

---

## 3. Rota Visual

Se `FAL_KEY` tiver valor:

- use Rota A
- crie prompts em ingles
- salve `output/temp/carrossel-[slug]/prompts.json`
- rode `node scripts/gerar-imagens-carrossel.js output/temp/carrossel-[slug]/prompts.json output/carrossel-[slug]/images`
- confirme que as imagens existem

Se nao tiver:

- use Rota B
- crie uma composicao tipografica forte com textura, grid/dots e acentos geometricos

---

## 4. HTML e Render

Crie um HTML por slide em `output/carrossel-[slug]/`.

Regras:

- 1080x1350
- texto critico no centro 1080x1080
- sem emojis
- slide 1 e ultimo com `src="__FOTO_PERFIL__"` se existir foto
- Rota A: imagem valorizada e overlay limpo
- Rota B: tipografia massiva e respiro

Renderize:

```bash
node scripts/renderizar.js output/carrossel-[slug]/slide-0X.html output/carrossel-[slug]/slide-0X.png
```

---

## 5. QA

Antes de finalizar, confirme:

- PNGs gerados
- quantidade de slides
- pasta final
- se pode enviar pelo Telegram quando configurado
