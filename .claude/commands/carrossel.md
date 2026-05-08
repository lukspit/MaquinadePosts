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

## FASE 2: Estratégia Editorial, Copy e Aprovação

Antes de criar qualquer HTML ou imagem, defina a estratégia do carrossel.

### Decisões obrigatórias

- **Tese central:** o que este carrossel defende.
- **Tensão real:** qual dor, erro, desejo ou contradição merece ser explicado.
- **Promessa:** o que a pessoa entende ou ganha ao chegar no fim.
- **Público:** para quem o carrossel está falando.
- **Ângulo próprio:** qual leitura torna este conteúdo específico, humano ou original.
- **Arco:** como a ideia evolui do contexto para a aplicação.
- **CTA:** uma ação final clara, sem dispersão.
- **Ritmo visual:** quais slides são densos, quais sintetizam, quais respiram e quais usam imagem.

### Planejamento de slides

Monte um plano com 6 a 9 slides, salvo se o tema claramente pedir outro tamanho.

Cada slide precisa ter uma função editorial. Planeje a ideia que será desenvolvida, não só a frase que aparecerá em destaque.

Mostre ao usuário o planejamento neste formato:

```text
Tese:
Promessa:
Ângulo próprio:
Rota visual:

Slide 1 — [função editorial] | [ideia-matriz] | [desenvolvimento em 2-4 linhas] | [layout] | [imagem/prompt se Rota A]
Slide 2 — [função editorial] | [ideia-matriz] | [desenvolvimento em 2-4 linhas] | [layout] | [imagem/prompt se Rota A]
...
Slide final — [síntese] | [CTA conectada à tese] | [layout]
```

Se estiver na Rota A, os prompts de imagem devem estar em inglês, com cena, sujeito, composição e iluminação. A imagem deve comunicar atmosfera, contexto ou símbolo visual; o texto principal fica no HTML.

Use o `pesquisa/instagram-framework.md` como metodologia editorial: carrossel denso, escaneável, útil, com ponto de vista e desenvolvimento real.
Use `skills/humanizer/SKILL.md` como revisão de linguagem: aplique a lógica de humanização na copy dos slides antes de criar o HTML, mantendo apenas a versão final no carrossel.

Na Rota A, imagem é recurso editorial, não obrigação em todos os slides. Em um carrossel de 7 a 9 slides, o padrão saudável é usar imagem em 3 a 5 slides e preservar alguns slides tipográficos/de síntese para ritmo e leitura. Use imagem em todos os slides apenas se o tema pedir uma narrativa visual contínua.

**BLOQUEIO:** pergunte:

> Posso gerar as imagens e montar os slides a partir desse plano?

Aguarde aprovação antes de continuar.

---

## FASE 3: Geração de Ativos

Execute esta fase apenas se estiver na Rota A.

1. Crie `output/temp/carrossel-[slug]/prompts.json`.
   - Cada prompt deve parecer fotografia editorial real, não banco de imagem genérico.
   - Inclua sujeito, cenário, ação, objeto simbólico, luz, câmera/ângulo e textura.
   - Prefira cenas específicas do tema a abstrações genéricas.
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
7. A copy deve seguir o planejamento aprovado: frase-matriz em destaque, desenvolvimento escaneável e exemplos quando fizer sentido.
8. Para imagens geradas localmente, use caminhos de arquivo normais no HTML/CSS. O `scripts/renderizar.js` embute essas imagens em base64 durante a renderização.

### Rota A

- A imagem é a arte principal.
- Use fotografias de forma seletiva, onde elas aumentam contexto, prova, atmosfera ou valor percebido.
- Intercale imagem com slides tipográficos ou de síntese para o carrossel respirar.
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
5. A sequência tem ritmo: abertura, contexto, desenvolvimento, síntese e CTA.
6. Os slides do meio entregam conteúdo real, com exemplos, contexto ou aplicação.
7. A identidade da marca foi respeitada.

Finalize informando:

- pasta final
- quantidade de slides
- se houve Rota A ou Rota B
- se pode enviar pelo Telegram quando configurado
