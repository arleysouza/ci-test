## Testes de Integração com Node.js, TypeScript, PostgreSQL e Redis

Este projeto exemplifica o uso de testes de integração em uma aplicação Node.js/TypeScript com Express, integrando:
- Banco de dados PostgreSQL
- Redis para blacklist de tokens
- Autenticação com JWT
- Docker/Docker Compose para isolar os recursos de teste
- Jest + Supertest para escrever e executar os testes automatizados

---


### 📌 Objetivo

O foco do repositório é demonstrar boas práticas de testes de integração em aplicações web:
- Como isolar os testes em uma pasta dedicada (`tests/`);
- Como configurar bancos de dados e cache temporários com Docker para os testes;
- Como validar fluxos de autenticação (login, logout, blacklist de tokens) de ponta a ponta;
- Como garantir que cada execução de teste seja independente e reproduzível.

---


🧑‍💻 Tecnologias Utilizadas

- Node.js + TypeScript – aplicação principal
- Express – servidor HTTP
- PostgreSQL – banco de dados
- Redis – armazenamento da blacklist de tokens JWT
- Docker + Docker Compose – orquestração dos serviços de teste
- Jest – framework de testes
- Supertest – simulação de requisições HTTP para testes de integração

---


### 📂 Estrutura de Pastas

```bash
app/
├── src/                     # Código da aplicação
│   ├── configs/             # Conexão com Postgres e Redis
│   ├── controllers/         # Controllers (ex: user.controller.ts)
│   ├── middlewares/         # Middlewares (auth, validação, erros)
│   ├── routes/              # Rotas Express
│   ├── types/               # Tipagem customizada
│   ├── utils/               # Funções auxiliares (ex: JWT)
│   └── index.ts             # Inicialização do servidor
│
├── tests/                   # Casos de teste (isolados da aplicação)
│   ├── controllers/         # Testes de controllers com Supertest
│   ├── helpers/             # App de teste sem app.listen()
│   └── jest.setup.ts        # Setup global (conexão e limpeza do BD/Redis)
│
├── .env                     # Configurações de desenvolvimento
├── .env.test                # Configurações específicas de teste
├── docker-compose.test.yml  # Serviços Docker para testes
├── jest.config.ts           # Configuração do Jest
└── tsconfig.json
```


---

### Execução do projeto

1. Clonando o repositório e instalando as dependências:
```bash
git clone https://github.com/arleysouza/testes-integracao.git app
cd app
npm i
```

2. Configurando o BD PostgreSQL
- Crie um BD chamado `bdaula` no PostgreSQL (ou outro nome de sua preferência);
- Atualize o arquivo `.env` com os dados de acesso ao banco;

3. Execute os comandos SQL presentes no arquivo `src/configs/comandos.sql` para criar as tabelas necessárias;

4. Subir o Redis com Docker
```bash
docker run --name redis -p 6379:6379 -d redis:alpine redis-server --requirepass 123
```
ou

```bash
npm run redis-start
```

5. Iniciando o servidor
```
npm start
npm run dev
```

6. Executando os testes
Graças à configuração do `package.json`, o comando `npm run test` já cuida de todo o ciclo de testes:
1. Sobe containers de PostgreSQL e Redis definidos em `docker-compose.test.yml`;
2. Executa os testes com Jest + Supertest;
3. Para os containers ao final;
Comando único para rodar tudo:
```bash
npm run test
```

### ▶️ Testando a API com REST Client

O arquivo `/http/requests.http` contém as requisições da aplicação (login, registro, logout, CRUD de contatos).
Para executá-las diretamente no VSCode, instale a extensão:

👉 REST Client (autor: Huachao Mao)

Após instalar, basta abrir o arquivo `requests.http`, clicar em `Send Request` sobre a requisição desejada, e o VSCode mostrará a resposta no editor.

---

### 🔑 Endpoints

**Registro de usuário**
``` bash
POST /users
```

**Login**
``` bash
POST /users/login
```
Resposta (exemplo):
```bash
{ "token": "eyJhbG..." }
```

**Logout**
``` bash
POST /users/logout
```
Invalida o token atual adicionando-o à blacklist no Redis.


---

### 📌 Por que usar blacklist de tokens no logout?

Os JWTs são imutáveis: uma vez emitidos, não podem ser revogados no servidor até que expirem.
Isso gera um problema: mesmo que o usuário faça logout, o token ainda seria válido até seu tempo de expiração.
Para resolver isso, utilizamos uma blacklist de tokens armazenada no Redis:
- No logout (`logoutUser` em `user.controller.ts`), o token é decodificado e adicionado ao Redis até o tempo de expiração (`exp`) definido no JWT;
- O token é armazenado de forma segura: apenas seu hash SHA-256 é gravado, evitando expor o JWT completo;
- No middleware de autenticação (`authMiddleware.ts`), antes de validar o token com `verifyToken` (`jwt.ts`), verificamos se o hash do token está na blacklist;
- Se estiver, a requisição é bloqueada imediatamente.
Assim, garantimos que tokens "descartados" não possam ser reutilizados, mesmo que ainda não tenham expirado.

---

### 📌 Tipagem customizada

1. Para o Express (`src/types/express/index.d.ts`)
- Estende a interface `Request` do Express para incluir a propriedade `req.user`, adicionada pelo middleware de autenticação.
- Permite que o TypeScript forneça autocompletar e checagem de tipos ao acessar `req.user` dentro das rotas.


2. Para variáveis globais (`src/types/global.d.ts`)
- Declara os objetos `global.pool` (PostgreSQL) e `global.redis` (Redis) usados nos testes.
- Evita que o TypeScript acuse erro de tipo quando usamos `global.pool.query(...)` ou `global.redis.ping()`.
- Garante que essas variáveis tenham tipagem forte, em vez de `any`.


***Observação sobre o `tsconfig.json`:**
Certifique-se de que a pasta `src/types` esteja incluída no `include` do `tsconfig.json`, por exemplo:
```json
{
  "compilerOptions": {
    ...
  },
  "include": ["src/**/*.ts", "src/types/**/*.d.ts"]
}
```

---


### 📌 Boas práticas aplicadas

- Testes organizados em pasta `tests/` (separados do código da aplicação).
- Uso de containers Docker exclusivos para os testes.
- Armazenamento em `tmpfs` (memória RAM) para rapidez e não persistência.
- Casos de sucesso e falha cobertos.
- Validação cruzada no banco e no Redis para garantir consistência.