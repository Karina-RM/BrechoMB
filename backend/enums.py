from enum import Enum


class ItemDepartment(str, Enum):
    ROUPAS_ACESSORIOS = "Roupas e Acessórios"
    CASA_DECORACAO = "Casa e Decoração"
    ELETRONICOS = "Eletrônicos e Eletrodomésticos"
    LIVROS_MIDIA = "Livros e Mídia"
    BRINQUEDOS_JOGOS = "Brinquedos e Jogos"
    OUTROS = "Outros"


class ItemCategory(str, Enum):
    # Roupas e Acessórios
    VESTIDO = "Vestido"
    BLUSA = "Blusa"
    CAMISA = "Camisa"
    SAIA = "Saia"
    CALCA = "Calça"
    SHORT = "Short"
    CASACO = "Casaco"
    JAQUETA = "Jaqueta"
    MOLETOM = "Moletom"
    MACACAO = "Macacão"
    CONJUNTO = "Conjunto"
    ACESSORIO = "Acessório"
    CALCADO = "Calçado"
    BOLSA = "Bolsa"
    # Casa e Decoração
    MOVEIS = "Móveis"
    DECORACAO = "Decoração"
    ILUMINACAO = "Iluminação"
    CAMA_MESA_BANHO = "Cama, mesa e banho"
    CORTINAS_TAPETES = "Cortinas e tapetes"
    UTENSILIOS_COZINHA = "Utensílios de cozinha"
    LOUCAS_VIDROS = "Louças e vidros"
    # Eletrônicos e Eletrodomésticos
    ELETRODOMESTICO = "Eletrodoméstico"
    ELETRONICO = "Eletrônico"
    INFORMATICA = "Informática"
    # Livros e Mídia
    LIVRO = "Livro"
    MIDIA = "Mídia (CD/DVD/vinil)"
    REVISTA = "Revista"
    # Brinquedos e Jogos
    BRINQUEDO = "Brinquedo"
    JOGO = "Jogo"
    # Compartilhado por todos os departamentos
    OUTRO = "Outro"


# Which categories are offered once a department is chosen — keeps the category
# dropdown short and relevant instead of one long list spanning every department.
# Frontend (app.js DEPARTMENT_CATEGORIES) must be kept in sync with this mapping.
DEPARTMENT_CATEGORIES: dict[ItemDepartment, list[ItemCategory]] = {
    ItemDepartment.ROUPAS_ACESSORIOS: [
        ItemCategory.VESTIDO,
        ItemCategory.BLUSA,
        ItemCategory.CAMISA,
        ItemCategory.SAIA,
        ItemCategory.CALCA,
        ItemCategory.SHORT,
        ItemCategory.CASACO,
        ItemCategory.JAQUETA,
        ItemCategory.MOLETOM,
        ItemCategory.MACACAO,
        ItemCategory.CONJUNTO,
        ItemCategory.ACESSORIO,
        ItemCategory.CALCADO,
        ItemCategory.BOLSA,
        ItemCategory.OUTRO,
    ],
    ItemDepartment.CASA_DECORACAO: [
        ItemCategory.MOVEIS,
        ItemCategory.DECORACAO,
        ItemCategory.ILUMINACAO,
        ItemCategory.CAMA_MESA_BANHO,
        ItemCategory.CORTINAS_TAPETES,
        ItemCategory.UTENSILIOS_COZINHA,
        ItemCategory.LOUCAS_VIDROS,
        ItemCategory.OUTRO,
    ],
    ItemDepartment.ELETRONICOS: [
        ItemCategory.ELETRODOMESTICO,
        ItemCategory.ELETRONICO,
        ItemCategory.INFORMATICA,
        ItemCategory.OUTRO,
    ],
    ItemDepartment.LIVROS_MIDIA: [
        ItemCategory.LIVRO,
        ItemCategory.MIDIA,
        ItemCategory.REVISTA,
        ItemCategory.OUTRO,
    ],
    ItemDepartment.BRINQUEDOS_JOGOS: [
        ItemCategory.BRINQUEDO,
        ItemCategory.JOGO,
        ItemCategory.OUTRO,
    ],
    ItemDepartment.OUTROS: [
        ItemCategory.OUTRO,
    ],
}


class ItemSize(str, Enum):
    PP = "PP"
    P = "P"
    M = "M"
    G = "G"
    GG = "GG"
    XG = "XG"
    UNICO = "Único"


class ShoeSize(str, Enum):
    N33 = "33"
    N34 = "34"
    N35 = "35"
    N36 = "36"
    N37 = "37"
    N38 = "38"
    N39 = "39"
    N40 = "40"
    N41 = "41"
    N42 = "42"
    N43 = "43"
    N44 = "44"
    UNICO = "Único"


# Which size vocabulary applies to a given category (within Roupas e Acessórios —
# every other department already hides Tamanho entirely). Categories not listed here
# default to ordinary clothing sizing (ItemSize).
SHOE_SIZE_CATEGORIES = {ItemCategory.CALCADO}
SIZELESS_CATEGORIES = {ItemCategory.ACESSORIO, ItemCategory.BOLSA}


class ItemCondition(str, Enum):
    NOVO_COM_ETIQUETA = "Novo com etiqueta"
    NOVO_SEM_ETIQUETA = "Novo sem etiqueta"
    SEMINOVO = "Seminovo"
    USADO = "Usado"


class PaymentMethod(str, Enum):
    DINHEIRO = "Dinheiro"
    CARTAO = "Cartão"
    PIX = "Pix"
