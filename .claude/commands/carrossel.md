# /carrossel — Linha de Produção Estratégica

Este comando transforma um tema, ideia, link ou transcrição em um carrossel pronto para postar.

Você segue uma sequência lógica de dependências. Não avance para uma fase sem concluir a anterior, verificar os arquivos no disco e respeitar as aprovações pedidas.

---

## FASE 1: Contexto e Rota

1. Leia `config/.env`.
   - Se `FAL_KEY` tiver valor: **ROTA A (Premium com imagens)**.
   - Se `FAL_KEY` estiver vazio: **ROTA B (Tipográfica)**.
2. Leia obrigatoriamente:
   - `CLAUDE.md`
   - `AGENTS.md`
   - `marca/perfil.md`
   - `marca/sistema-visual.css`
   - `pesquisa/instagram-framework.md`
3. Se a marca não estiver configurada, pare e conduza o usuário para `/começar`.

---

## FASE 2: Estratégia, Copy e Aprovação

Antes de criar qualquer HTML ou imagem, defina a estratégia do carrossel.

### Decisões obrigatórias

- **Tese central:** o que este carrossel defende.
- **Tensão:** qual dor, erro, desejo ou contradição faz a pessoa continuar deslizando.
- **Promessa:** o que a pessoa entende ou ganha ao chegar no fim.
- **Público:** para quem o carrossel está falando.
- **Arco:** como cada slide puxa o próximo.
- **CTA:** uma ação final clara, sem dispersão.
- **Ritmo visual:** quais slides têm impacto, quais têm respiro e quais têm imagem.

### Planejamento de slides

Monte um plano com 6 a 9 slides, salvo se o tema claramente pedir outro tamanho.

Mostre ao usuário o planejamento neste formato:

```text
Tese:
Promessa:
Rota visual:

Slide 1 — [layout] | [copy] | [imagem/prompt se Rota A]
Slide 2 — [layout] | [copy] | [imagem/prompt se Rota A]
...
Slide final — [layout] | [CTA]
```

Se estiver na Rota A, os prompts de imagem devem estar em inglês, com cena, sujeito, composição e iluminação. Não peça texto longo dentro da imagem.

**BLOQUEIO:** pergunte:

> Posso gerar as imagens e montar os slides a partir desse plano?

Aguarde aprovação antes de continuar.

---

## FASE 3: Geração de Ativos

Execute esta fase apenas se estiver na Rota A.

1. Crie `output/temp/carrossel-[slug]/prompts.json`.
2. Rode:

```bash
node scripts/gerar-imagens-carrossel.js output/temp/carrossel-[slug]/prompts.json output/carrossel-[slug]/images
```

3. Verifique o disco:

```bash
ls output/carrossel-[slug]/images
```

Se a pasta estiver vazia ou faltar imagem, não avance. Corrija os prompts ou rode novamente.

Quando estiver tudo certo, diga:

> Imagens geradas com sucesso. Vou montar os slides agora.

---

## FASE 4: HTML e Renderização

1. Crie um HTML por slide em `output/carrossel-[slug]/`.
2. Use 1080x1350.
3. Mantenha o conteúdo crítico dentro da área central 1080x1080.
4. Nunca use emojis.
5. Se `marca/foto.*` existir, use `src="__FOTO_PERFIL__"` no slide 1 e no último.
6. Use os layouts e regras de `AGENTS.md`.

### Rota A

- A imagem é a arte principal.
- Use Hero Fade, Split Lateral ou Split Horizontal.
- Texto sobre foto sempre precisa de contraste real: overlay escuro, bloco sólido ou área limpa.
- Não coloque glow, textura ou SVG por cima de fotografia.

### Rota B

- Use tipografia massiva, hierarquia clara e contraste forte.
- Use textura sutil, grid/dots e linhas de acento.
- Use geometria minimalista para representar conceitos.

Renderize cada slide:

```bash
node scripts/renderizar.js output/carrossel-[slug]/slide-0X.html output/carrossel-[slug]/slide-0X.png
```

---

## FASE 5: Verificação Final

Antes de finalizar, verifique:

1. PNGs existem em `output/carrossel-[slug]/`.
2. Todos os slides esperados foram renderizados.
3. O slide 1 tem impacto imediato.
4. O texto está legível em mobile.
5. A sequência tem ritmo: impacto, desenvolvimento, respiro e CTA.
6. A identidade da marca foi respeitada.

Finalize informando:

- pasta final
- quantidade de slides
- se houve Rota A ou Rota B
- se pode enviar pelo Telegram quando configurado
