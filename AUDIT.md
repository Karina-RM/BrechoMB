# Brechó — Auditoria de código e UX (pós-v1)

**Data da auditoria:** 09/08/2026
**Escopo:** leitura completa de `backend/` (todos os routers, `models.py`, `schemas.py`, `domain.py`, `splits.py`, `admin_auth.py`), `frontend/` (`app.js`, `index.html`, `admin.js`), `tests/`, `roadmap.md` e screenshots.
**Propósito deste doc:** lista priorizada de correções e melhorias, no mesmo formato do `roadmap.md`, para ser trabalhada pela instância do Claude Code no repositório. Cada item traz o problema, o arquivo/local, a correção proposta e o critério de aceite. Trabalhar **na ordem das prioridades** (P0 → P3); dentro de cada prioridade, na ordem listada.

**Método de trabalho esperado:** TDD sempre que o item tocar regra de negócio — escrever o teste que falha primeiro, depois a correção. A suíte atual (`tests/test_splits.py`, 10 testes) deve continuar passando após cada item.

---

## O que está correto e NÃO deve ser mexido

Registrado para a instância não "consertar" o que já é decisão deliberada:

- Claim atômico no checkout (`UPDATE items SET status='sold' WHERE id=? AND status='in_stock'` + checagem de `rowcount`) — padrão correto, manter.
- Soft delete de peças com histórico preservado; `deleted` invisível fora do painel admin — deliberado.
- Allow-list de tabelas no painel admin (`ADMIN_TABLES`) antes de interpolar identificador em SQL — correto, é o único jeito seguro em sqlite3. `admin_auth` fora da lista — manter fora.
- Fotos como data-URL base64 em requisição separada — workaround documentado do bug de FormData do WKWebView. Não "modernizar" para multipart.
- Sessões admin em memória — trade-off documentado e aceitável para app local.
- Comentários explicando *porquê* — manter esse padrão em todo código novo.

---

## P0 — Correção do núcleo (dinheiro)

### 0.1 Migrar valores monetários de REAL (float) para centavos inteiros

- **Problema:** todo valor monetário (`items.price`, `sales.sale_price`, `sales.catalog_price`, `splits.*_amount`, `receipt_payments.amount`, `suppliers.commission_pct` fica como está — é percentual, não dinheiro) é `REAL`/float. O sistema existe para **dividir dinheiro entre duas sócias e fornecedoras**; float acumula erro binário (`0.1 + 0.2 !== 0.3`), e o sintoma já está no código: a tolerância `abs(items_total - payments_total) > 0.01` no `checkout()` (`routers/sales.py`) existe para mascarar exatamente isso.
- **Correção:** armazenar **centavos como INTEGER** em todas as colunas monetárias. Converter na borda: API continua aceitando/devolvendo reais com 2 casas (float no JSON é aceitável na serialização, o cálculo interno é que não pode ser float). `calculate_split` passa a operar em centavos inteiros; a comissão vira divisão inteira com resto atribuído de forma determinística (ver 0.2).
- **Migração:** adicionar passo em `migrate_schema()` (`models.py`) seguindo o padrão já existente de recriação de tabela: novas colunas INTEGER, `UPDATE ... SET x_cents = CAST(ROUND(x * 100) AS INTEGER)`, drop das antigas. Testar a migração com um banco populado por fixture.
- **TDD:** reescrever `tests/test_splits.py` primeiro para centavos (os mesmos 10 casos do roadmap, valores × 100), ver falhar, então migrar `splits.py`. Adicionar casos de resto: `sale_price=999` (R$ 9,99) com `commission_pct=33.33` — a soma das três partes **deve** ser exatamente `999`.
- **Aceite:** invariante em todo teste de split: `owner_a + owner_b + supplier == sale_price` (igualdade exata de inteiros, sem tolerância). A tolerância `> 0.01` do checkout é removida e vira igualdade exata da soma dos pagamentos em centavos.

### 0.2 Política de arredondamento explícita e testada

- **Problema:** hoje `supplier_amount` e o corte de 20% da Dona A são arredondados de forma independente (`round(x, 2)`), e a Dona B absorve o resíduo. Funciona na maioria dos casos, mas a política não está declarada nem testada — e `round()` do Python é banker's rounding, que surpreende em `round(2.675, 2)`.
- **Correção:** com centavos inteiros (0.1), definir explicitamente: comissão da fornecedora = `(sale_cents * commission_pct_bp) // 10_000` usando comissão em basis points, corte da Dona A = `sale_cents * 20 // 100`, Dona B = resto. Documentar em docstring de `calculate_split` que **o resto sempre fica com a dona do lado da peça** (decisão a confirmar com as donas se preferirem outra política; registrar no roadmap §2 depois de confirmada).
- **Aceite:** teste parametrizado varrendo `sale_cents` de 1 a 10_000 com comissões 0, 10, 25, 33.33, 100% — invariante da soma exata em todos.

---

## P1 — Robustez que a usuária sente

### 1.1 Escapar HTML em toda interpolação do frontend

- **Problema:** `app.js` renderiza tudo via template literals em `innerHTML` (55 ocorrências) sem nenhum escape. Nome de fornecedora, marca, cor, observações, motivo de desconto — tudo entra cru no DOM. Uma observação legítima como `preço < R$50` ou uma marca com `&` **quebra a renderização**; um valor com `<img onerror=...>` executa script (XSS armazenado — severidade baixa dado o modelo de ameaça de duas usuárias locais, mas o caso inocente do `<` e `&` é bug real de uso diário).
- **Correção:** criar `esc(value)` (replace de `& < > " '`) no topo de `app.js` e aplicar em **toda** interpolação de dado vindo da API ou de input. Não aplicar em fragmentos de markup gerados pelo próprio código (ícones SVG de `CATEGORY_ICON_PATHS`, classes).
- **Aceite:** cadastrar peça com observação `a < b & "c"` e fornecedora `<b>X</b>` — tudo renderiza literalmente em Estoque, ficha da peça, checkout, Fornecedoras, Relatórios e histórico de edições.

### 1.2 Tratamento consistente de erro de fetch + componente de toast

- **Problema:** só 17 dos ~55 `fetch` checam `res.ok`. `loadSettings()` faz `fetch(...).then(r => r.json())` direto — um 500 vira erro de parse de JSON silencioso. Não existe sistema de notificação; falha em refresh de fundo simplesmente não aparece. O README aconselhando "feche e abra o programa" é o sintoma disso na ponta da usuária.
- **Correção:** helper único `api(path, options)` que: faz o fetch, checa `res.ok`, extrai `detail` do corpo de erro do FastAPI, lança erro com mensagem em PT-BR; e um componente de **toast** (canto inferior, auto-dismiss, estilo consistente com os alerts já existentes em `alertBlock`) usado pelo helper em falha. Migrar todas as chamadas para o helper.
- **Aceite:** derrubar o backend com a tela aberta → toda ação mostra toast "sistema indisponível — feche e abra o programa" em vez de falhar em silêncio; erro 400 de validação mostra o `detail` do backend no toast ou no alert do formulário.

### 1.3 Corrigir geração de SKU vulnerável a colisão

- **Problema:** `_generate_sku()` (`routers/items.py`) usa `COUNT(*) WHERE sku LIKE 'A-%'`. O painel admin permite **hard-delete** de linhas de `items`; após um delete, o próximo cadastro colide com a UNIQUE constraint e estoura como 500 sem mensagem.
- **Correção (TDD):** teste que cria 3 peças, deleta a do meio via SQL direto, cria a 4ª — deve receber SKU novo sem erro. Implementação: `SELECT MAX(CAST(substr(sku, 3) AS INTEGER)) FROM items WHERE sku LIKE ?` + 1.
- **Aceite:** teste acima passa; SKUs continuam no formato `A-0001`.

### 1.4 Estorno de venda com repasse já pago

- **Problema:** `void_sale` não verifica `splits.paid_at` nem `owner_*_paid_at`. Estornar venda cuja comissão já foi marcada como paga deixa dinheiro pago pendurado em venda estornada — os relatórios filtram `voided_at IS NULL`, então o valor pago **some dos totais** em vez de aparecer como estorno a compensar.
- **Correção (decisão de produto embutida — implementar a conservadora):** bloquear o estorno com 400 e mensagem clara ("esta venda tem repasse já pago — desmarque o pagamento antes de estornar") quando qualquer `paid_at` da split estiver preenchido. É reversível pela própria UI (mark-unpaid) e não inventa fluxo de clawback.
- **TDD:** teste API (ver 2.1) — venda → mark-paid → void ⇒ 400; mark-unpaid → void ⇒ 200 e peça volta ao estoque.

---

## P2 — Testes e segurança

### 2.1 Suíte de testes de API (a maior dívida do projeto)

- **Problema:** só `splits.py` tem teste. O código mais arriscado — checkout multi-peça com rollback, void, payouts, validação cruzada departamento/categoria/tamanho no `update_item`, histórico de edições — tem cobertura zero.
- **Correção:** `tests/conftest.py` com fixture que aponta `DB_PATH` para `tmp_path` (monkeypatch em `backend.db`), roda `init_db()` e devolve um `TestClient`. Arquivos: `test_items_api.py`, `test_sales_api.py`, `test_owners_api.py`, `test_admin_api.py`.
- **Casos mínimos obrigatórios:**
  - Checkout com 2 peças em que a 2ª está `sold` → 400 **e a 1ª continua `in_stock`** (rollback do claim — hoje depende do rollback implícito do `conn.close()`; o teste trava esse comportamento).
  - Checkout de peça de fornecedora grava split congelado; mudar `commission_pct` depois **não** altera a split gravada.
  - Void reabre peça; segunda venda da mesma peça após void funciona (índice único parcial).
  - `update_item` de peça `sold` → 400; edição válida grava `item_edits` com old/new; edição que troca departamento sem trocar categoria incompatível → 400.
  - Cenário single-owner: desativar Dona B, vender peça do lado B → split inteira para Dona A.
  - Admin: acesso sem cookie → 401; tabela fora da allow-list → 404; `admin_auth` inacessível.
- **Aceite:** `python -m pytest` verde; itens P0/P1 acima já entram com seus testes escritos nesse formato.

### 2.2 Hash + rate-limit do PIN

- **Problema:** `owners.pin` é texto puro comparado com `!=` (`routers/owners.py`), enquanto a senha admin usa PBKDF2 com `secrets.compare_digest` — o helper certo já existe em `admin_auth.py`. Sem limite de tentativas, 4 dígitos = 10.000 combinações. Agravante: a coluna `pin` em texto puro é legível pelo painel admin (tabela `owners` está na allow-list), o que enfraquece a própria senha admin.
- **Correção:** colunas `pin_hash` + `pin_salt` (migração em `migrate_schema`, invalidando PINs atuais — as donas recadastram, é aceitável); reusar `hash_password`/`verify_password`; contador de tentativas em memória por owner com lockout de 30s após 5 erros (mesmo espírito das sessões admin em memória). Excluir `pin_hash`/`pin_salt` da leitura do painel admin ou mascarar na resposta de `list_rows` para a tabela `owners`.
- **Aceite:** teste de API: 5 PINs errados → 6ª tentativa retorna 429 mesmo com PIN certo; após lockout, PIN certo → 200. Nenhum endpoint devolve hash/salt.

### 2.3 Higiene menor de backend

- `@app.on_event("startup")` está deprecado → migrar para `lifespan` em `main.py`.
- `requirements.txt` sem versões → pinar (`fastapi==`, `uvicorn[standard]==`, `pywebview==`, `python-multipart==`, `pytest==`) com as versões que hoje funcionam no Mac da loja.
- `routers/items.py` importa `SALE_SELECT`, `_payments_by_receipt`, `_row_to_sale` de `routers/sales.py` (privados de outro router) → extrair para `backend/queries.py` e importar dos dois lados. Sem mudança de comportamento; cobrir com os testes de 2.1 antes de mover.
- `update_item` monta `SET` a partir dos nomes de campo do Pydantic — seguro hoje porque o modelo restringe as chaves, mas frágil. Adicionar allow-list explícita de colunas editáveis no router (mesmo padrão do painel admin) para o invariante não depender do formato do schema.

---

## P3 — Estrutura do frontend e UX

### 3.1 Modularizar `app.js` (2.715 linhas, sem quebrar a filosofia sem-build)

- **Correção:** dividir em ES modules nativos (`<script type="module">`, sem bundler): `api.js` (helper do 1.2), `esc.js`, `state.js` (sessão/tema), e um módulo por view (`inventory.js`, `sales.js`, `suppliers.js`, `reports.js`, `settings.js`, `lock.js`). Substituir os `onclick="..."` inline por `addEventListener`/delegação — pré-requisito para os módulos, já que handlers inline exigem funções globais.
- **Aceite:** zero `onclick=` em HTML gerado; `python app.py` continua funcionando sem passo de build novo (o npm continua só para CSS/vendor, como hoje).

### 3.2 Miniaturas de foto na tabela de Estoque

- **Motivo:** para brechó, reconhecimento visual da peça é o identificador mais rápido que existe — mais que SKU. As fotos já existem e já são lazy-loaded na ficha.
- **Correção:** coluna de thumbnail (~40px, `loading="lazy"`, fallback no ícone de categoria já implementado em `CATEGORY_ICON_PATHS`), primeira coluna antes do SKU.

### 3.3 Limpeza visual e consistência

- Células vazias renderizam "—" em quase toda linha (Categoria/Tamanho no screenshot real de uso) → deixar vazio; o travessão só onde a ausência é informação (ex.: Fornecedora em venda de garimpada).
- Formulário "Adicionar peça": **Departamento é obrigatório no backend (`Form(...)`) mas não exibe o asterisco vermelho** que "Pertence a" e "Preço" têm → adicionar o `*` e a validação client-side antes do submit.
- `<img>` sem `alt` em todo o app → `alt=""` nas decorativas (thumbnail redundante com a linha) e `alt` descritivo (`Foto da peça A-0001`) na galeria da ficha. Rotular com `aria-label` os botões só-ícone gerados em JS.

### 3.4 Fila de UX para validar com as donas antes de implementar

Registrar, não implementar sem confirmação: (a) filtro rápido "só em estoque" como default da tela de Estoque, já que vendidas/retiradas vêm agrupadas abaixo mas ainda pesam na página; (b) atalho de teclado para abrir "Registrar venda" (uso de balcão); (c) relatório de confiabilidade de fornecedora (roadmap §7) continua pendente de definição do limiar — os dados de `withdrawals` já estão sendo coletados para isso.

---

## Ordem de execução sugerida (resumo)

1. **2.1 primeiro na prática:** o `conftest.py` + TestClient é pré-requisito de TDD para quase tudo acima — criar a fixture e os testes de comportamento *atual* antes de tocar em P0.
2. P0 (0.1 → 0.2) — migração para centavos com a suíte protegendo.
3. P1 (1.1 → 1.4).
4. Restante de P2 (2.2 → 2.3).
5. P3.

Cada item = um commit (ou PR) próprio, mensagem citando o número do item deste doc.
