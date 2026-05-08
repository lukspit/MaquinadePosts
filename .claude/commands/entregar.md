# /entregar — Enviar para o Telegram

Envia o carrossel mais recente (ou um específico) para o Telegram.

---

## Pré-condições

### Verificar Telegram configurado

Execute `ls config/.env 2>/dev/null`.

Se não existir:
> "O Telegram ainda não está configurado. Quer configurar agora? É simples — você vai receber os carrosséis direto no celular. Leva uns 3 minutos."

Se o usuário quiser configurar, siga o fluxo de configuração do Telegram descrito no `/começar`.

Se o usuário não quiser:
> "Ok. Os carrosséis ficam na pasta `output/`. Quando quiser configurar, é só chamar `/entregar` novamente."

### Verificar que há carrosséis gerados

Execute `ls output/ 2>/dev/null`.

Se `output/` estiver vazia ou só tiver `.gitkeep`:
> "Nenhum carrossel gerado ainda. Quer criar um agora? Me conta o tema."

---

## Seleção do carrossel

Liste as pastas em `output/` (excluindo `temp/` e arquivos soltos).

Se houver apenas um carrossel:
> "Vou enviar o carrossel '[nome]' — [N] slides. Confirma?"

Se houver mais de um:
> "Qual carrossel você quer enviar?
> 1. [nome-carrossel-1] — [N] slides
> 2. [nome-carrossel-2] — [N] slides
> ...
> (ou 'o mais recente' para enviar o último)"

Aguarde a escolha.

---

## Envio

Execute:
```
node scripts/entregar.js output/carrossel-[nome]/
```

Informe o progresso: "Enviando slide 1/[N]..." conforme os slides forem sendo enviados.

Se todos chegarem com sucesso:
> "Carrossel enviado — [N] slides entregues no Telegram."

---

## Tratamento de erros

**Erro 403 (Forbidden):**
> "O bot está bloqueado. Você precisa mandar uma mensagem para ele primeiro — procure pelo nome do bot no Telegram, mande qualquer coisa, e tente de novo."

**Erro 400 (Bad Request):**
> "Algo no token ou chat_id está errado. Quer que eu verifique as configurações?"

Se sim, leia `config/.env`, mostre os valores (mascarando parte do token: `1234...xyz`), e pergunte se estão corretos.

**Arquivo muito grande (>10MB):**
O script `entregar.js` já faz fallback automático para `sendDocument`. Se isso acontecer, informe:
> "Os slides foram enviados como documentos (arquivos) — o Telegram não aceita fotos acima de 10MB. A qualidade da imagem está preservada."

**Erro de rede:**
> "Houve um problema de conexão. Verifique sua internet e tente novamente."
