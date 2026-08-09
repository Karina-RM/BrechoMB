# Brechó

Sistema de controle de estoque, vendas e fornecedoras para o brechó — feito para rodar direto no computador da loja, sem precisar de internet.

![Tela de Estoque](docs/screenshots/estoque.jpg)

Este documento é o manual de uso do sistema. Ele foi escrito para quem usa o programa no dia a dia — não é preciso nenhum conhecimento técnico para seguir os passos abaixo.

## Índice

- [Como abrir o programa](#como-abrir-o-programa)
- [Conhecendo as áreas do sistema](#conhecendo-as-áreas-do-sistema)
- [Estoque](#estoque)
  - [Adicionar uma peça](#adicionar-uma-peça)
  - [Departamento e Categoria](#departamento-e-categoria)
  - [Filtrar e ver mais colunas](#filtrar-e-ver-mais-colunas)
  - [Ver os detalhes de uma peça](#ver-os-detalhes-de-uma-peça)
  - [Retirar uma peça](#retirar-uma-peça)
- [Vendas](#vendas)
- [Como o dinheiro de cada venda é dividido](#como-o-dinheiro-de-cada-venda-é-dividido)
- [Fornecedoras](#fornecedoras)
- [Proprietárias](#proprietárias)
  - [Criar ou redefinir seu PIN](#criar-ou-redefinir-seu-pin)
- [Relatórios](#relatórios)
- [Perguntas frequentes](#perguntas-frequentes)
- [Para desenvolvedores](#para-desenvolvedores)

---

## Como abrir o programa

O sistema roda como um aplicativo comum do computador. Basta dar dois cliques no ícone do **Brechó** para abrir.

> **Se a tela parecer "travada" ou não mostrar uma peça que você acabou de cadastrar:** feche o programa completamente (não só a janela — feche de verdade) e abra de novo. Isso resolve quase todos os casos em que a tela parece desatualizada.

Não é preciso internet para usar o sistema. Tudo fica salvo no próprio computador da loja.

---

## Conhecendo as áreas do sistema

No menu do lado esquerdo ficam as cinco áreas do sistema:

| Área | Para que serve |
|---|---|
| **Estoque** | Cadastrar peças novas e ver tudo que está (ou já esteve) na loja |
| **Vendas** | Registrar uma venda e ver o histórico de vendas |
| **Fornecedoras** | Cadastrar fornecedoras e acompanhar quanto se deve a cada uma |
| **Proprietárias** | Criar/redefinir seu PIN e ver seus próprios ganhos e repasses |
| **Relatórios** | Ver o resumo geral da loja e como as vendas estão indo |

No canto superior direito, a bolinha ao lado de "conectado" mostra se o sistema está funcionando normalmente. Se aparecer vermelho e "sistema indisponível", feche e abra o programa novamente. Se alguma ação específica falhar (por exemplo, uma tela que não carregou), um aviso também aparece por alguns segundos no canto inferior da tela.

---

## Estoque

A tela de Estoque mostra todas as peças já cadastradas — à venda, vendidas ou retiradas por uma fornecedora.

### Adicionar uma peça

Clique no botão **"+ Adicionar peça"**, no canto superior direito da tela de Estoque.

![Formulário de adicionar peça](docs/screenshots/adicionar-peca.jpg)

Um painel abre do lado direito com os campos abaixo. Os campos marcados com **\*** são **obrigatórios** — todos os outros são opcionais e podem ficar em branco se você não souber ou não for relevante para aquela peça.

| Campo | O que preencher |
|---|---|
| **Pertence a** \* | Se a peça é garimpada por uma das donas, ou se veio de uma fornecedora cadastrada |
| **Departamento** \* | A seção geral da peça — roupa, casa, eletrônico, etc. (veja a explicação abaixo) |
| **Categoria** | O tipo exato da peça dentro do departamento escolhido |
| **Tamanho** | Só aparece quando faz sentido para a categoria escolhida (veja abaixo) |
| **Condição** | Novo com etiqueta, novo sem etiqueta, seminovo ou usado |
| **Preço** \* | O preço de venda, em reais. Pode digitar com vírgula (`100,00`) ou ponto (`100.00`) — os dois funcionam |
| **Marca** | Se tiver etiqueta visível. Pode deixar em branco |
| **Cor / Estampa** | Ex: floral, listrado, vermelho |
| **Material** | Ex: seda, couro, algodão |
| **Observações** | Qualquer detalhe importante — um defeito, uma mancha, algo que vale avisar na hora da venda |
| **Fotos** | Uma ou mais fotos da peça. Clique em "Choose Files" para escolher as imagens do computador |

Depois de preencher, clique em **"Adicionar ao estoque"**. O sistema gera automaticamente um código (SKU) para a peça, como `A-0001` ou `B-0003` — a letra indica de qual dona é o lado daquela peça.

### Departamento e Categoria

Como a loja não vende só roupa, o cadastro é dividido em dois passos: primeiro o **Departamento** (a seção geral), depois a **Categoria** (o tipo exato dentro daquela seção). A lista de Categoria só aparece depois que você escolhe o Departamento.

Departamentos disponíveis e as categorias de cada um:

- **Roupas e Acessórios** — Vestido, Blusa, Camisa, Saia, Calça, Short, Casaco, Jaqueta, Moletom, Macacão, Conjunto, Acessório, Calçado, Bolsa, Outro
- **Casa e Decoração** — Móveis, Decoração, Iluminação, Cama/mesa/banho, Cortinas e tapetes, Utensílios de cozinha, Louças e vidros, Outro
- **Eletrônicos e Eletrodomésticos** — Eletrodoméstico, Eletrônico, Informática, Outro
- **Livros e Mídia** — Livro, Mídia (CD/DVD/vinil), Revista, Outro
- **Brinquedos e Jogos** — Brinquedo, Jogo, Outro
- **Outros** — para qualquer peça que não se encaixe nas seções acima

Se não tiver certeza, use **"Outro"** dentro do departamento mais parecido. Não tem problema nenhum.

**Sobre o campo Tamanho:** ele muda de acordo com a categoria escolhida —

- Para roupas normais (vestido, blusa, calça...): aparecem os tamanhos de roupa (PP, P, M, G, GG, XG, Único).
- Para **Calçado**: aparece a numeração de sapato brasileira (33 a 44, ou Único).
- Para **Bolsa** e **Acessório**: o campo Tamanho nem aparece, porque não se aplica.
- Para qualquer peça fora do departamento Roupas e Acessórios: o campo Tamanho também não aparece.

### Filtrar e ver mais colunas

No topo da tela de Estoque tem dois filtros: um por **departamento** e outro por **status** (em estoque, vendido, retirado). Por padrão, a tela já abre mostrando só peças **"Em estoque"** — troque para "Todos os status" para ver também as vendidas e retiradas. Use os filtros para achar peças mais rápido numa lista grande.

A tabela mostra só as colunas mais importantes por padrão, para caber bem na tela. Clique em **"Mostrar mais colunas"** para ver também Departamento, Marca, Cor/Estampa, Material, Condição e Observações. Clique de novo (agora "Mostrar menos colunas") para voltar ao modo compacto.

### Ver os detalhes de uma peça

Clique em **"Detalhes"**, na frente de qualquer peça na lista, para abrir a página completa daquela peça — com todas as fotos, todos os campos preenchidos e, se a peça já foi vendida ou retirada, também os detalhes da venda ou da retirada.

![Detalhes de uma peça](docs/screenshots/peca-detalhe.jpg)

### Retirar uma peça

Se uma fornecedora quiser levar de volta uma peça que não vendeu, clique em **"Retirar"** na linha daquela peça (só aparece para peças de fornecedoras que ainda estão em estoque). O sistema pede uma confirmação antes de marcar a peça como retirada — ela não é apagada, só passa a aparecer esmaecida na lista, para manter o histórico.

---

## Vendas

Vendas são registradas direto na tela de **Estoque**, não em Vendas — essa tela é só para consultar o histórico. Para registrar uma venda:

- **Uma peça só:** clique em **"Vender"** no card da peça. Um preço grande e editável aparece (já preenchido com o preço cadastrado, mas pode ser alterado), junto com a forma de pagamento e um campo opcional de motivo do desconto.
- **Várias peças de uma vez:** clique em **"Modo carrinho"**, marque as peças vendidas e finalize a venda com um único pagamento para todas.

Depois de confirmar, a peça passa automaticamente para "vendido" e some da lista de peças disponíveis.

![Tela de Vendas](docs/screenshots/vendas.jpg)

A cada venda, o sistema já calcula e guarda como o valor foi dividido entre Dona A, Dona B e a fornecedora (se houver). Essa divisão nunca muda depois — mesmo que a comissão de uma fornecedora seja alterada no futuro, as vendas já registradas mantêm o valor de quando foram feitas.

Na tela de Vendas é possível **"Estornar"** uma venda feita por engano — a peça volta para o estoque. Se o repasse dessa venda (para a fornecedora ou para uma das donas) já tiver sido marcado como pago, o sistema não deixa estornar direto: é preciso desmarcar o pagamento primeiro (em Fornecedoras ou Proprietárias), para que o valor pago não fique "perdido" sem aparecer em nenhum relatório.

---

## Como o dinheiro de cada venda é dividido

Essa é a regra por trás dos números que aparecem em Vendas e Relatórios. Toda peça pertence a um "lado" — o de Dona A ou o de Dona B — e a divisão do valor da venda depende de qual lado é e se a peça é garimpada ou de fornecedora.

1. **Peça garimpada pela própria Dona A** → Dona A fica com **100%** do valor.
2. **Peça garimpada pela Dona B** → Dona A recebe **20%**, Dona B fica com os outros **80%**.
3. **Peça de uma fornecedora do lado da Dona A** → a fornecedora recebe a comissão dela, e Dona A fica com o restante (sem desconto de 20%, porque a peça já é do lado dela).
4. **Peça de uma fornecedora do lado da Dona B** → Dona A recebe **20%** do valor, a fornecedora recebe a comissão dela, e Dona B fica com o que sobrar.

Em outras palavras: Dona A sempre tem uma participação de 20% em tudo que é vendido do lado da Dona B — nas peças dela e nas peças das fornecedoras dela. O contrário não acontece: Dona B não recebe nada das vendas do lado da Dona A.

A comissão de cada fornecedora é definida no cadastro dela (veja [Fornecedoras](#fornecedoras)) e pode ser diferente para cada uma — ela é a única fonte da comissão usada nas vendas dessa fornecedora, não existe mais uma comissão específica por peça.

---

## Fornecedoras

Em **Fornecedoras**, clique em **"+ Adicionar fornecedora"** para cadastrar uma nova. É preciso informar o nome, de qual dona ela é fornecedora e a comissão padrão dela (em %).

![Tela de Fornecedoras](docs/screenshots/fornecedoras.jpg)

Na lista, é possível alterar a comissão de uma fornecedora a qualquer momento — edite o número e clique em "Salvar". Isso não muda o valor de vendas já registradas, só das próximas.

> **Uma fornecedora não pode ser transferida para a outra dona dentro do sistema.** Se isso realmente precisar acontecer (uma fornecedora que passou a fornecer para a outra sócia), é uma correção que precisa ser feita por fora, com quem dá suporte técnico ao sistema — não é uma opção do dia a dia, de propósito.

Clique em **"Detalhes"** para ver a página completa de uma fornecedora: todas as peças que ela já forneceu, quanto ainda se deve repassar a ela, e o histórico de peças que ela retirou sem vender.

![Detalhes de uma fornecedora](docs/screenshots/fornecedora-detalhe.jpg)

**Confiabilidade:** no topo da página da fornecedora, um card mostra que porcentagem das peças dela venderam em até **1 semana** da entrada — uma peça que não vende nessa janela, que é retirada sem vender, ou que já passou de uma semana ainda parada no estoque, conta contra esse número. 50% ou mais recebe o selo **"Confiável"**; abaixo disso, **"Atenção"**. Peças cadastradas há menos de uma semana e ainda não vendidas não entram na conta — é cedo demais para julgar.

---

## Proprietárias

Essa é a tela de cada dona: criar ou trocar o próprio PIN de acesso, e ver os próprios ganhos e repasses — sem misturar com os da outra sócia.

Ao abrir **Proprietárias**, escolha **"Dona A"** ou **"Dona B"** no topo para ver a aba daquela dona.

### Criar ou redefinir seu PIN

O PIN é o código de 4 a 6 dígitos que identifica qual dona está usando o sistema — ele existe para privacidade entre as duas e para saber quem vendeu ou editou o quê, não como proteção contra invasores. Por isso o teclado embaralha a posição dos números toda vez que aparece.

**Na primeira vez que uma dona usa o sistema:**

1. Na tela inicial ("Quem está usando o sistema?"), clique no seu nome.
2. Como ainda não existe PIN cadastrado, o sistema pede **"Crie um PIN (4 a 6 dígitos)"** — digite o PIN escolhido no teclado embaralhado.
3. Em seguida pede para digitar de novo, para confirmar. Se os dois números baterem, o PIN fica salvo e você já entra no sistema.

**Para trocar um PIN depois** (esqueceu o seu, ou só quer trocar):

1. Vá em **Proprietárias** e escolha a aba da dona (a sua, ou a da outra — qualquer uma pode redefinir o PIN da outra, caso ela tenha esquecido).
2. Clique em **"Redefinir PIN"**, no canto superior direito da aba.
3. O mesmo fluxo de "crie um PIN" acima aparece de novo — digite o novo PIN duas vezes para confirmar.

Depois de 5 tentativas erradas seguidas ao digitar o PIN na tela de login, o sistema bloqueia novas tentativas por 30 segundos, mesmo que a próxima tentativa seja o PIN certo — é só esperar e tentar de novo.

### Desempenho e repasses

Abaixo do PIN, cada aba mostra o desempenho daquela dona: peças vendidas, receita gerada, quanto ela ganhou, e quanto se deve (e já foi pago) às fornecedoras do lado dela — com um filtro de período (hoje, últimos 7 dias, este mês, etc.). Logo abaixo, uma tabela mostra a venda por fornecedora, só das fornecedoras daquele lado.

Mais abaixo, a tabela **"Repasses"** lista cada venda com comissão a repassar para aquela dona (o corte de 20% que Dona A recebe do lado da Dona B, por exemplo) — marque como pago um repasse de cada vez, ou selecione vários e clique em **"Registrar repasse dos selecionados"**.

---

## Relatórios

A tela de Relatórios traz um resumo geral da loja: total de vendas, receita total, vendas por categoria e vendas ao longo do tempo — números que qualquer pessoa olhando a tela pode ver sem problema, já que não identificam nem uma dona nem uma fornecedora específica.

![Tela de Relatórios](docs/screenshots/relatorios.jpg)

Logo abaixo dos números, há duas tabelas com mais detalhe: vendas por categoria e vendas ao longo do tempo (por mês ou por dia).

Mais abaixo, o card **"Repasses"** mostra o total combinado (das duas donas e de todas as fornecedoras juntas) do que já foi repassado e do que ainda falta repassar. Os valores ficam **borrados por padrão** — clique no ícone de olho ao lado do título "Repasses" para revelar, e o sistema esconde de novo sozinho na próxima vez que você entrar em Relatórios. O quanto **cada dona** ganhou e o quanto **cada fornecedora** vendeu não aparecem aqui — para ver o detalhe de uma dona específica, use os atalhos **"Ver detalhamento de: Dona A / Dona B"**, que levam direto para a aba dela em [Proprietárias](#proprietárias).

---

## Perguntas frequentes

**A tela não atualiza depois que eu cadastro uma peça.**
Feche o programa completamente e abra de novo. Isso resolve praticamente sempre.

**Coloquei o preço mas o sistema disse que o campo estava vazio.**
Pode digitar o preço com vírgula (`100,00`) normalmente — o sistema já entende os dois formatos. Se ainda acontecer, confira se realmente há um número no campo antes de salvar.

**Não sei em qual departamento ou categoria colocar uma peça.**
Use "Outros" como departamento, ou "Outro" como categoria dentro do departamento que parecer mais próximo. Não tem problema cadastrar assim.

**Uma fornecedora quer levar de volta uma peça.**
Vá até a peça em Estoque e clique em "Retirar". A peça fica marcada como retirada, sem custo, e continua no histórico.

**Uma das donas saiu do negócio — o que muda?**
Isso é uma situação rara e é resolvida por quem dá suporte técnico ao sistema, não pelo uso normal do dia a dia. A partir do momento em que só resta uma dona ativa, todo o valor das vendas passa a ir integralmente para ela (menos a comissão de fornecedoras, que continua sendo paga normalmente).

**Esqueci meu PIN.**
A outra dona pode redefinir para você: em [Proprietárias](#criar-ou-redefinir-seu-pin), na sua aba, "Redefinir PIN". Se as duas esquecerem, é preciso suporte técnico direto no banco de dados.

**Errei 5 vezes o PIN e agora não consigo tentar de novo.**
É proposital — depois de 5 erros seguidos, o sistema bloqueia por 30 segundos antes de aceitar uma nova tentativa, mesmo que seja o PIN certo. Espere meio minuto e tente de novo.

**Tentei estornar uma venda e o sistema não deixou.**
O repasse dessa venda (para a fornecedora ou para uma das donas) já foi marcado como pago. Desmarque o pagamento primeiro — em Fornecedoras ou Proprietárias — e depois o estorno funciona normalmente.

---

## Para desenvolvedores

Aplicativo de desktop local: **FastAPI** (Python) servindo uma interface **HTML/CSS/JS** simples (sem framework), empacotado com **pywebview**. Banco de dados **SQLite**, tudo local — sem servidor externo, sem sincronização entre dispositivos.

### Rodando o projeto

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Alterando o front-end

O CSS é gerado a partir dos componentes do Tailwind Plus e precisa ser recompilado depois de qualquer mudança em `frontend/index.html` ou `frontend/src/input.css`:

```bash
npm install
npm run build
```

Isso gera `frontend/styles.css` e `frontend/vendor/elements.js` — os dois são versionados no repositório, já que o aplicativo empacotado não tem Node.js disponível em tempo de execução.

### Testes

```bash
pytest
```

### Painel de administração

Existe um painel separado do aplicativo principal, para correções pontuais direto no banco de dados. Não é uma tela de uso diário e não tem nenhum link dentro do sistema — só é alcançável por quem sabe o endereço e a senha.

**Acesso:** com o aplicativo rodando, abra `http://127.0.0.1:8000/admin.html` numa aba de navegador comum. A janela do Brechó não tem barra de endereço, então não dá para chegar lá por dentro dela — é preciso abrir num navegador à parte, em paralelo.

**Senha:** independente do PIN das donas, definida via terminal:

```bash
python -m backend.set_admin_password
```

Pede a senha duas vezes (não aparece na tela) e salva o hash no banco. Pode ser rodado de novo a qualquer momento para trocar a senha.

**O que o painel faz:** ver, criar, editar e excluir diretamente qualquer linha de qualquer tabela do banco (donas, fornecedoras, peças, vendas, recibos, repasses, retiradas e histórico de edições) — como um mini admin do Django. A tabela com a senha do próprio painel nunca aparece nele, para não haver risco de se trancar para fora. Nas linhas de `owners`, as colunas `pin_hash`/`pin_salt` aparecem mascaradas (`***`), mesmo para quem tem acesso ao painel.

**Cuidado:** o painel edita o banco direto, sem passar pelas regras de negócio que o resto do sistema aplica — por exemplo, o cálculo de divisão de uma venda ou a trava que impede vender a mesma peça duas vezes. Use só para corrigir um dado errado, não para operações do dia a dia. Excluir uma linha é definitivo.

### PIN das donas

O PIN de cada dona é hasheado (PBKDF2, mesmo helper da senha do painel admin — `backend/admin_auth.py`) — nunca fica em texto puro no banco. Há um bloqueio de 5 tentativas erradas / 30 segundos por dona, em memória (reseta se o servidor reiniciar, mesmo trade-off já aceito para as sessões do painel admin). Não existe endpoint nem comando de terminal para "gerar" um PIN pelo backend — ele só é criado ou trocado pela própria interface (veja [Criar ou redefinir seu PIN](#criar-ou-redefinir-seu-pin)), que é também o fluxo que as donas usam no dia a dia.

### Dinheiro

Todo valor monetário é armazenado como **centavos inteiros** no banco (`backend/money.py` faz a conversão para reais na borda da API) — nunca float — para não acumular erro de arredondamento. `AUDIT.md` documenta essa e outras decisões técnicas de uma auditoria de código feita no projeto, com o histórico do que foi encontrado e corrigido.

`roadmap.md` documenta as decisões de negócio e o histórico de planejamento do projeto.
