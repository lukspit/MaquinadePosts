# /marca — Atualizar Perfil da Marca

Atualiza o perfil da marca sem refazer o setup completo. Use quando quiser mudar cores, fonte, tom de voz, nicho, ou qualquer outro elemento da identidade visual.

---

## Sequência

### Passo 1 — Leitura do estado atual

Leia `marca/perfil.md` silenciosamente.

Se o arquivo estiver vazio ou não existir:
> "O perfil da marca ainda não foi configurado. Vamos criar agora — é rápido. Me conta o nome da sua marca/perfil e o nicho."

Se existir, continue para o Passo 2.

### Passo 2 — Mostrar o que existe

Mostre um resumo do perfil atual:
> "Aqui está o perfil atual da sua marca:
> - Nome: [nome]
> - Nicho: [nicho]
> - Público: [público]
> - Cor principal: [cor]
> - Estilo: [estilo]
> - Tom de voz: [tom]
>
> O que você quer atualizar?"

Aguarde a resposta. Não faça o usuário responder sobre tudo — só o que eles querem mudar.

### Passo 3 — Coleta de mudanças

Faça perguntas apenas sobre o que o usuário quer mudar. Exemplos:

**Se for cor:**
> "Qual a nova cor principal? (hex, nome, ou uma direção — como 'algo mais sóbrio')"

Se disser direção sem hex: sugira 2-3 opções concretas com os hexes.

**Se for fonte:**
> "Qual fonte? (pode ser um nome do Google Fonts, ou uma descrição — como 'algo mais elegante e fino')"

Se descrever sem nome: sugira 2-3 fontes do Google Fonts com o link para preview.

**Se for nicho ou público:**
> "Qual o novo nicho / novo público-alvo?"

**Se for tom de voz:**
> "Como você descreveria o novo tom? E tem algum exemplo de comunicação que admira nesse estilo?"

### Passo 4 — Atualização dos arquivos

Atualize `marca/perfil.md` com as mudanças.

Se as mudanças afetarem o sistema visual (cores, fonte, estilo), regenere `marca/sistema-visual.css` completamente.

Mostre ao usuário o que foi alterado:
> "Feito. Atualizei o perfil com:
> - [lista das mudanças]
> - [se visual mudou] Sistema visual CSS regenerado com as novas cores/fontes."

### Passo 5 — Confirmação

> "Os próximos carrosséis já vão usar a nova identidade. Quer criar um agora para ver como fica?"

---

## Nota

A pesquisa do Instagram (`pesquisa/instagram-framework.md`) **não é atualizada** neste comando — ela é independente da marca. Se quiser atualizar a pesquisa, delete o arquivo e use `/começar` (vai refazer apenas a fase de pesquisa).
