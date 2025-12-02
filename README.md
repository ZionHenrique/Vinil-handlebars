# Sistema de Gestão de Vinis
2 ano A<br>
Luany Rose Lima de Mélo<br>
Raquel Mariana Silva Nascimento <br>
Zion Henrique Parcelino Cordeiro Germano<br>

## Problema 

 dificuldades:
- Controle inadequado do estoque de vinis (quantidade disponível, preços, informações dos álbuns)
- Dificuldade em gerenciar informações de clientes e seus perfis de compra
- Falta de organização dos gêneros musicais e categorização dos produtos
- Processos manuais propensos a erros e perda de informações

## Como o Sistema Resolve

O Sistema de Gestão de Vinis é uma aplicação web que automatiza e organiza:
- **Gestão de Estoque**: Cadastro completo de vinis com informações detalhadas (nome do álbum, artista, preço, ano, quantidade em estoque e gêneros musicais)
- **Gestão de Clientes**: Cadastro e manutenção de perfis de clientes com informações de contato e endereço
- **Organização por Gêneros**: Sistema de categorização por gêneros musicais para facilitar a busca e organização do catálogo
- **Operações CRUD Completas**: Permite criar, visualizar, editar e excluir registros de forma simples e intuitiva

Com isso, a loja pode ter controle total sobre seu inventário, melhorar o atendimento aos clientes e organizar melhor seu catálogo de produtos.

## Requisitos da Aplicação

### CRUD de Vinis
- O operador pode cadastrar novos vinis com informações completas (nome, artista, preço, ano, quantidade, gêneros)
- Deve ser possível listar todos os vinis cadastrados
- Deve ser possível visualizar os detalhes de um vinil específico
- Deve ser possível editar informações de um vinil existente
- Deve ser possível excluir um vinil do sistema

### CRUD de Perfis
- O operador pode cadastrar perfis de clientes (nome, email, telefone, endereço)
- Deve ser possível listar todos os perfis cadastrados
- Deve ser possível visualizar os detalhes de um perfil específico
- Deve ser possível editar informações de um perfil existente
- Deve ser possível excluir um perfil do sistema

### CRUD de Gêneros
- O operador pode cadastrar novos gêneros musicais (nome e descrição)
- Deve ser possível listar todos os gêneros cadastrados
- Deve ser possível visualizar os detalhes de um gênero específico
- Deve ser possível editar informações de um gênero existente
- Deve ser possível excluir um gênero do sistema

### Tela Principal
- Deve existir uma tela home que fornece acesso rápido a todos os CRUDs do sistema
- A tela principal deve permitir navegação para listagem e cadastro de cada entidade

## Tecnologias Utilizadas

- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web para Node.js
- **Handlebars** - Motor de templates para renderização de páginas
- **HTML/CSS** - Interface do usuário

## Como Executar

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor:
```bash
npm start
```

3. Acesse no navegador:
```
http://localhost:3000
```

npm install sequelize sqlite3


