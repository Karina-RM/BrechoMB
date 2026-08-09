# Brechó — Roadmap

**Status:** Todos os itens da revisão crítica (seção 6) implementados, incluindo o carrinho de múltiplas peças. Pendente: apenas o limiar/definição de "retirada recorrente em curto prazo" (seção 7), a definir com dados reais de uso — sem bloqueio para o v1.
**Repositório atual:** https://github.com/Karina-RM/BrechoMB
**Plataforma:** app de desktop para macOS, uso local (um único Mac, sem sincronização)
**Propósito deste doc:** fonte única de verdade das decisões de planejamento e dos pontos a corrigir/implementar. Para ser repassado à instância do Claude Code que já está trabalhando no repositório.

---

## 1. Contexto do negócio

O brechó pertence a **duas donas**. Cada uma:
- Vende suas próprias peças garimpadas — adquiridas por ela, sem relação com fornecedora.
- Tem sua própria rede de fornecedoras, que consignam peças para venda na loja.

Toda peça da loja pertence a uma de três categorias:
1. Garimpada — peça própria da Dona A
2. Garimpada — peça própria da Dona B
3. Peça de fornecedora — consignada, e cada fornecedora está vinculada a uma dona específica (A ou B)

## 2. Regras de divisão da venda (confirmadas)

- **Dona A** (a dona do corte especial) recebe:
  - **100%** do valor de venda das suas próprias peças garimpadas.
  - **20%** do **valor cheio de venda** de qualquer outra peça vendida pertencente ao lado da **Dona B** — seja peça garimpada da Dona B, seja peça de uma fornecedora da Dona B.
  - Esse corte é **unidirecional** — a Dona B não recebe corte equivalente sobre as vendas da Dona A.
- **Dona B** recebe o restante depois dos cortes aplicáveis.
- **Fornecedoras** recebem uma **comissão %** sobre o valor cheio de venda de suas peças — comissão **configurável por fornecedora**, nunca fixa no código.
- Peça de fornecedora **não vendida** pode ser **retirada a qualquer momento, sem custo**.
- **Confirmado:** peças de fornecedoras da própria Dona A **não sofrem o corte de 20%** — só a comissão da fornecedora é subtraída, o restante fica com a Dona A.
- **Confirmado:** a divisão calculada é **congelada no momento da venda** (nunca recalculada retroativamente se a comissão de uma fornecedora mudar depois).

### Exemplos de cálculo (preço de venda = P)
- Peça de fornecedora do lado da Dona B: Dona A = `0,20 × P` · Fornecedora = `comissão% × P` · Dona B = `P − Dona A − Fornecedora`
- Peça garimpada da Dona B: Dona A = `0,20 × P` · Dona B = `0,80 × P`
- Peça garimpada da Dona A: Dona A = `100% × P`
- Peça de fornecedora do lado da Dona A: Fornecedora = `comissão% × P` · Dona A = `P − Fornecedora` (sem corte de 20%)

## 3. Stack técnica (decidida)

- **Backend:** Python (FastAPI)
- **Frontend:** HTML/CSS/JS local, sem framework pesado — critério explícito: bonito e intuitivo, **nunca** com cara de Tkinter
- **Empacotamento:** pywebview (janela nativa) + PyInstaller (.app)
- **Arquitetura:** um único Mac, usado pelas duas donas — sem rede, sem sincronização. Autenticação: PIN local leve, ver seção 6.5.
- **Armazenamento:** SQLite local — confirmado
- **UI components:** o cliente possui licença do **Tailwind UI Plus** e já compartilhou os snippets desses componentes diretamente com a instância do Claude Code — usar esses componentes como base ao invés de construir do zero.

## 4. Escopo do v1 (confirmado)

Todas as quatro áreas abaixo são prioridade de v1, não faseamento:
- Controle de estoque
- Vendas / checkout
- Gestão de fornecedoras e repasses
- Relatórios

## 5. Cadastro de peça (confirmado)

Campos de entrada: foto(s), tamanho, condição, categoria, preço, e **SKU** (gerado automaticamente, formato exato ainda em aberto).

Retiradas de fornecedora: a peça **não é apagada** — fica registrada como uma entrada "retirada" (visualmente esmaecida no histórico). Isso existe especificamente para permitir **detectar padrões de retirada recorrente em curto prazo por fornecedora**, sinalizando fornecedoras pouco confiáveis ao longo do tempo (funcionalidade de v1: relatório de confiabilidade por fornecedora).

---

## 6. Revisão crítica da implementação atual

> Análise feita lendo o código-fonte do repositório acima (`backend/routers/sales.py`, `backend/routers/items.py`, `backend/splits.py`, `backend/domain.py`, `frontend/app.js`), não apenas o README.

### 6.1 O que está correto e deve ser mantido
- A lógica de divisão está implementada certinho, batendo com a seção 2 acima, incluindo o caso das fornecedoras da própria Dona A.
- Arredondamento por resto (não por soma de partes arredondadas) — evita o total não bater com a soma das partes.
- Split gravado por venda na tabela `splits`, imune a mudança futura de comissão.
- `owner_id`/`supplier_id` de uma peça são imutáveis via API (não têm campo de edição) — decisão correta, evita corromper histórico de comissão ao reatribuir peça de lado.
- Exclusão de peça (`DELETE /api/items/{id}`) é bloqueada para qualquer peça que não esteja mais em estoque — protege contra apagar peça com venda/retirada associada.

### 6.2 Problemas a corrigir — Processo de venda (implementado, exceto o ponto em aberto)

- [x] **Condição de corrida (double-sell).** Corrigido: `create_sale` agora faz `UPDATE items SET status='sold' WHERE id=? AND status='in_stock'` e checa `rowcount` antes de calcular o split — SQLite serializa escritores, então essa checagem é atômica mesmo sob requisições concorrentes. Testado com duas requisições simultâneas via `curl`: exatamente uma sucede, a outra recebe 400.
- [x] **Não existe estorno/cancelamento de venda.** Implementado `POST /api/sales/{id}/void`: reabre a peça para estoque e marca `voided_at`, sem apagar a venda — ela continua aparecendo (esmaecida) na tela de Vendas com "Estornada", e sai dos relatórios. `sales.item_id` deixou de ser `UNIQUE` simples e virou um índice único parcial (`WHERE voided_at IS NULL`), para permitir vender a mesma peça de novo após um estorno.
- [x] **Preço de venda pode fugir do catalogado sem rastro.** `sales.catalog_price` grava o preço da peça no momento da venda, e um campo opcional "Motivo do desconto" (`discount_reason`) fica disponível no formulário de venda e na ficha da peça.
- [x] **Nenhum registro de quem realizou a venda.** Resolvido via a sessão por PIN (6.5): `sold_by_owner_id` é obrigatório em toda venda e preenchido automaticamente com `session.ownerId` no frontend — nunca pedido explicitamente à usuária.
- [ ] **Uma venda = uma peça**, sem noção de carrinho/recibo agrupado para múltiplas peças na mesma visita — confirmar se é intencional para o tamanho da loja. **Ainda em aberto, não implementado nesta fase.**
- [x] **Forma de pagamento não é capturada.** Campo obrigatório `payment_method` (Dinheiro/Cartão/Pix) no formulário de venda, exibido na tela de Vendas e na ficha da peça.

### 6.3 Problema a corrigir — Edição de peças (implementado)

- [x] **Não existe nenhuma tela de edição de peça no frontend.** Implementado: botão "Editar" na tela de detalhes da peça (visível mesmo para peça vendida/retirada, ao contrário do "Excluir peça") troca o `<dl>` de leitura por um formulário editável no lugar — mesmo padrão do "Salvar" de comissão da tela de fornecedoras, sem drawer separado — ligado ao `PATCH /api/items/{id}` já existente. Não inclui "Pertence a" (imutável, §6.1) nem foto (o `PATCH` nunca aceitou foto).
- [x] **`PATCH /api/items/{id}` agora bloqueia edição de preço/comissão fora de `in_stock`.** Rejeita com 400 apenas quando o valor *realmente muda* — reenviar o valor atual junto de outro campo editado continua funcionando, então travar preço não impede corrigir observação/marca/etc. de uma peça já vendida.
- [x] **Toda edição fica registrada.** Tabela `item_edits` (peça, campo, valor antigo, valor novo, quem, quando) alimentada automaticamente pela sessão de PIN (§6.5) — só grava os campos que de fato mudaram, nunca reenvios sem alteração — e exibida como linha do tempo "Histórico de edições" na ficha da peça. Sem gate de acesso, conforme o princípio adotado: confiança vem do registro visível, não do bloqueio.

### 6.4 Redesign de UX — tela de venda (público-alvo: senhoras 50+) (implementado)

O fluxo atual (página "Vendas" dedicada, peça escolhida a partir de lista/dropdown) exigia leitura e reconhecimento textual do item — a tarefa mais difícil para esse público. Prototipamos e validamos junto ao cliente uma alternativa baseada em reconhecimento visual, agora implementada:

- [x] Lista/dropdown **substituída** por um grid de cards com foto na própria tela de Estoque (placeholder "Sem foto" para peça ainda não fotografada).
- [x] Botão **"Vender" direto no card** — sem trocar de página nem procurar a peça de novo.
- [x] Ao clicar "Vender", expande **inline** no próprio card: preço grande e editável, forma de pagamento, motivo do desconto opcional (já carrega os campos do 6.2), botão "Confirmar venda" evidente e "Cancelar".
- **Decisão ao implementar:** o antigo formulário de venda por dropdown (drawer "+ Registrar venda" na página Vendas) foi removido, não apenas complementado — confirmado com o cliente que o card substitui esse fluxo por completo, evitando dois caminhos concorrentes para a mesma ação. A página Vendas mantém o histórico + estorno (6.2); as ações "Retirar" e "Excluir peça", antes na tabela de estoque, passaram para a ficha da peça.

### 6.5 Autenticação local e trava por inatividade (implementado — nível de proteção calibrado à realidade da loja)

> A decisão anterior era "sem autenticação formal". O cliente pediu reconsiderar, e depois calibrou o escopo: é uma loja pequena, bairro tranquilo, duas donas de confiança — **não há preocupação real com alguém tomando o Mac ou acessando o banco de dados diretamente**. Isso não é uma omissão, é a avaliação de risco real do cliente para o contexto da loja. A função disso é **privacidade entre as duas + atribuição limpa no histórico**, não um sistema de segurança contra invasores.

**Proposta (nível certo para o contexto):**
- Cada dona tem um **PIN próprio** (4–6 dígitos) — identifica quem está usando, sem fricção de login tradicional.
- Ao abrir o app (ou após a trava), a pessoa escolhe seu nome (Dona A / Dona B) e digita o PIN — a sessão fica atribuída a ela, alimentando o histórico de auditoria já previsto em 6.3.
- **Trava por inatividade** (ex: 5–10 min, configurável): tela bloqueia, pedindo o PIN de novo — mas **não é logout completo**. Se a **mesma pessoa** digitar o PIN, a tela volta exatamente para onde estava (nenhum dado de formulário em andamento é perdido). Se **outra pessoa** logar, inicia uma sessão nova, do zero.
- **Teclado numérico com posição embaralhada:** a cada vez que o teclado for exibido (login e retomada após trava), os dígitos 0-9 aparecem em posições diferentes — dificulta que alguém observando de lado ("shoulder surfing") memorize o PIN pela posição dos dedos. Esse é o item de valor real aqui: evita que uma cliente na loja veja o PIN de relance.
- **Redefinição de PIN:** qualquer uma das donas pode redefinir o próprio PIN (e, se esquecido, a outra dona pode redefini-lo por ela) direto numa tela de configurações do app — sem depender de suporte técnico externo. Isso resolve a pergunta em aberto anterior.
- **Deliberadamente fora de escopo:** hashing forte de PIN, bloqueio por tentativas erradas, proteção contra acesso direto ao arquivo SQLite, expiração de sessão além da trava por inatividade. Nenhum desses agrega valor real para duas sócias de confiança numa loja pequena — adicionar isso seria complexidade sem benefício prático.
- [x] **A confirmar:** tempo exato de inatividade até travar — implementado como constante `INACTIVITY_MS` no topo de `frontend/app.js` (10 min), fácil de ajustar depois sem virar uma tela de configuração.

**Implementado (2026-08-03):** coluna `owners.pin` (texto simples, sem hashing — conforme decisão de escopo acima), endpoints `POST /api/owners/{id}/verify-pin` e `PATCH /api/owners/{id}` (agora aceita `pin` opcional), tela de trava em `frontend/app.js`/`index.html` com o teclado embaralhado, retomada em exatamente o mesmo lugar para a mesma dona, reinício para Estoque quando a outra dona loga, e tela de Configurações para redefinição de PIN sem gate de acesso. `session.ownerId`/`session.ownerName` ficam disponíveis globalmente no frontend para os itens 6.2 ("quem vendeu") e 6.3 ("quem editou") consumirem quando forem implementados.

---

## 7. Perguntas em aberto

- [x] Formato exato do SKU — confirmado com o cliente: o formato já implementado (prefixo por lado da dona + sequencial, ex: `A-0001`, `B-0001`) resolve a questão, sem mudança necessária.
- [ ] Limiar/definição de "retirada recorrente em curto prazo" (ex: retirada em até N dias da entrada, X vezes) — melhor definir com dados reais de uso
- [x] **"Uma venda = uma peça" — confirmado que não era suficiente.** Cliente pediu suporte a carrinho (várias peças, uma venda/recibo só). Implementado: tabela `receipts` (forma de pagamento + vendida-por compartilhados por toda a venda), `sales` referencia um `receipt_id` — cada peça mantém seu próprio split/estorno, só o pagamento e quem vendeu ficam no nível do recibo. Fluxo de "Vender" direto no card (6.4) foi mantido intacto para o caso de uma peça só; um novo toggle "Modo carrinho" na tela de Estoque cobre o caso de várias peças — dois botões separados, sem ambiguidade sobre qual usar. Checkout é atômico: se qualquer peça do carrinho não estiver mais disponível, a venda inteira é rejeitada, nada é vendido parcialmente.

## 8. Instruções de implementação para o Claude Code

- Usar a **skill hallmark** para remover "ai slop" do código e do conteúdo gerado durante a implementação destes itens — nomes genéricos, comentários redundantes, boilerplate desnecessário, etc.
- Usar os **componentes do Tailwind UI Plus** (licença do cliente, snippets já compartilhados diretamente com o Claude Code) como base do frontend, em vez de construir componentes de UI do zero.
- Preservar os padrões já corretos listados na seção 6.1 — não refatorar essa lógica, só as áreas listadas em 6.2, 6.3 e 6.4.
- Manter o mesmo princípio de "nunca apaga, registra" já usado nas retiradas de fornecedora — aplicar o mesmo espírito no estorno de venda e no histórico de edição.

## 9. Log de decisões

| Data | Decisão |
|------|----------|
| 2026-07-31 | App será um app de desktop macOS local para gerenciar o brechó |
| 2026-07-31 | Modelo misto: estoque próprio + estoque em consignação |
| 2026-07-31 | Duas donas, cada uma com peças garimpadas próprias e fornecedoras próprias |
| 2026-07-31 | Uma dona recebe 100% das suas vendas garimpadas + 20% (unidirecional) de tudo do lado da outra dona |
| 2026-07-31 | Comissão de fornecedora é 100% configurável, nunca fixa no código |
| 2026-07-31 | Peça de fornecedora não vendida pode ser retirada livremente, a qualquer momento |
| 2026-07-31 | Backend: Python. Frontend: moderno/bonito, nunca Tkinter — recomendado FastAPI + frontend web local via pywebview |
| 2026-07-31 | Um único Mac, um único dispositivo, usado pelas duas donas — sem sync/multi-dispositivo |
| 2026-07-31 | v1 inclui as quatro áreas centrais: estoque, vendas/checkout, repasses a fornecedoras, relatórios |
| 2026-07-31 | Confirmado: fornecedoras da própria Dona A não sofrem o corte de 20% |
| 2026-07-31 | Cadastro de peça inclui: foto(s), tamanho, condição, categoria, preço, SKU |
| 2026-07-31 | Armazenamento: SQLite. Moeda: BRL. SKU: gerado automaticamente, sequencial |
| 2026-07-31 | Peça de fornecedora retirada fica como entrada esmaecida no histórico (não apagada), para viabilizar rastreamento de confiabilidade de fornecedora |
| 2026-08-03 | Revisão crítica do repositório existente: identificada condição de corrida na venda, ausência de estorno, ausência de rastro de desconto, ausência de identificação de quem vendeu |
| 2026-08-03 | Identificado: endpoint de edição de peça existe no backend mas não está conectado a nenhuma tela do frontend |
| 2026-08-03 | Decisão de UX: tela de venda vai migrar de lista/dropdown para grid de cards com foto e ação "Vender" contextual, com confirmação inline grande — validada com protótipo interativo |
| 2026-08-03 | Princípio adotado para edição de peças: sem restrição de acesso por papel/login — confiança via histórico de alterações visível, não via bloqueio |
| 2026-08-03 | Cliente possui licença do Tailwind UI Plus e já compartilhou snippets dos componentes com o Claude Code — usar como base do frontend |
| 2026-08-03 | Revisão da decisão de "sem autenticação": cliente pediu login local simples (PIN por dona) + trava por inatividade + retomada de sessão para o mesmo usuário, proposta detalhada na seção 6.5 |
| 2026-08-03 | Teclado de PIN deve embaralhar a posição dos dígitos a cada exibição, para dificultar shoulder-surfing |
| 2026-08-03 | Nível de proteção da autenticação calibrado à realidade da loja: sem preocupação com acesso ao Mac/banco de dados por terceiros — PIN + trava por inatividade servem para privacidade e atribuição entre as duas donas, não para blindagem contra invasores. Hashing forte, bloqueio por tentativas e proteção de arquivo ficam fora de escopo |
| 2026-08-03 | Item 6.5 (PIN + trava por inatividade) implementado e testado ponta a ponta — escolhido como próxima fase antes de 6.2/6.3 porque ambos dependem da sessão por PIN para identificar quem vendeu/editou |
| 2026-08-03 | Item 6.2 (processo de venda) implementado e testado ponta a ponta: condição de corrida corrigida, estorno de venda, preço catalogado + motivo do desconto, forma de pagamento obrigatória, e "vendida por" preenchido automaticamente pela sessão. Único ponto do checklist que ficou em aberto: "uma venda = uma peça" (carrinho), por depender de confirmação do cliente |
| 2026-08-03 | Item 6.3 (edição de peças) implementado e testado ponta a ponta: botão "Editar" na ficha da peça (edição in-place, sem drawer separado), trava de preço/comissão fora de `in_stock` só quando o valor muda de fato, e histórico "item_edits" com quem/quando/campo/valor antigo/novo alimentado pela sessão de PIN |
| 2026-08-03 | Item 6.4 (redesign da tela de venda) implementado e testado ponta a ponta: grid de cards com foto no Estoque substitui a lista/dropdown, "Vender" expande inline com preço grande editável + pagamento + desconto opcional. Drawer antigo de venda por dropdown removido (confirmado com o cliente); "Retirar"/"Excluir peça" migraram da tabela de estoque para a ficha da peça. Com isso, todos os itens da seção 6 (revisão crítica) estão implementados |
| 2026-08-03 | Perguntas em aberto da seção 7 resolvidas com o cliente: formato de SKU atual (`A-0001`/`B-0001`) confirmado como suficiente; "uma venda = uma peça" não era suficiente — cliente pediu carrinho de múltiplas peças |
| 2026-08-03 | Carrinho de múltiplas peças implementado e testado ponta a ponta: tabela `receipts` compartilha pagamento/vendida-por entre as peças de uma mesma venda, cada peça mantém split e estorno independentes. Fluxo "Vender" de uma peça só (6.4) mantido sem alteração — "Modo carrinho" é um toggle separado, decisão do cliente para não misturar os dois fluxos. Checkout é atômico (peça indisponível cancela a venda inteira, nada fica parcialmente vendido) |
| 2026-08-09 | Limiar do relatório de confiabilidade de fornecedora (§7) definido pelo cliente: peça é "ruim" se não vendida em 1 semana da entrada. Implementado como % de peças vendidas em até 7 dias sobre o total de peças com desfecho definido (vendida, retirada sem vender, ou ainda em estoque e já vencida) — peças ainda dentro da janela ficam de fora do cálculo. ≥50% vira selo "Confiável" na ficha da fornecedora; percentual bruto sempre visível |

---
*Este arquivo deve continuar sendo atualizado ao longo do desenvolvimento. Adicione novas decisões ao log e marque as perguntas em aberto conforme forem resolvidas.*
