<div align="center">
  <h1>Kindred</h1>
  <p>
    <strong><a href="#-english">English</a></strong> | <strong><a href="#-português">Português</a></strong>
  </p>
</div>

---

<a id="-english"></a>
## 🇬🇧 English

A full-stack web application that quantifies user "taste" and discovers compatible users through a feature-based vector similarity algorithm.

-----

## Live Demo & Screenshots

*   **Live Application:** [Link to your deployed Render/Vercel site]

## Features

*   **Dual-Mode Ranking Interface:** Experience a seamless ranking process with a fluid **drag-and-drop** interface on desktop and an intuitive **tap-to-rank** system on mobile. The responsive design ensures a great experience on any device.
*   **Secure & Modern Authentication:** Your account is protected with a robust authentication system using JWTs, which are securely stored in `httpOnly` cookies to prevent common web vulnerabilities.
*   **Persistent & Sharable Tier Lists:** Never lose your work. All rankings are automatically saved to your profile and can be revisited and updated anytime.
*   **Discover Your "Kin":** Go beyond simple rankings and find users who truly share your cinematic tastes. The "Kin" page presents a sorted list of users based on a deep "taste DNA" similarity score.
*   **The "Taste DNA" Algorithm:** The project's core innovation. Instead of just comparing movie-for-movie, it analyzes your preferences across genres, directors, and decades to build a unique vector profile of your taste, enabling more meaningful user matching.

## Core Concept: The "Taste DNA" Algorithm

Instead of just matching you with people who like the same movies, Kindred tries to understand the *essence* of your taste—the genres, directors, and eras you gravitate towards. It then finds other users who share that same underlying "Taste DNA," even if you haven't ranked the same set of films.

This is achieved through a two-part system:

### 1\. The Write Path (Calculating the Vector)

When a user saves a tier list, a "fire-and-forget" `recalculateProfileVector` function is triggered on the backend.

1.  **Data Collection:** The service fetches *all* items the user has *ever* ranked.
2.  **Mapping:** Each item's tier (S-F) is mapped to a score (e.g., `S: +3`, `A: +2`, `F: -2`).
3.  **Aggregation:** The system aggregates these scores against every *feature* associated with the items (e.g., `Action`, `1990s`, `Christopher Nolan`).
4.  **Shrinkage (Bayesian Average):** To prevent low-count biases (e.g., ranking one "Action" movie as "S"), the final affinity score for each feature is calculated using a "dampening" formula:
    `affinity = totalScore / (k + count)`
      * `totalScore`: The sum of scores for a feature (e.g., `+25` for "Action").
      * `count`: The number of "Action" items ranked.
      * `k`: A fixed dampening factor (e.g., `3`).
5.  **Storage:** The final `vector(256)` is saved to the `users` table.

### 2\. The Read Path (Finding Similar Users)

When a user visits the "Kin" page, the backend executes a fast, indexed search.

1.  **Metric:** Similarity is defined by `Cosine Similarity`, which measures the *angle* between two profile vectors, ignoring magnitude.
2.  **Database:** PostgreSQL with the `pg_vector` extension.
3.  **Query:** We use the `<=>` (Cosine Distance) operator.
4.  **Performance:** The search is nearly instantaneous (even with millions of users) by using an `ivfflat` (Inverted File Flat) index on the `profile_vector` column.

-----
## Tech Stack

  * **Monorepo:** Managed with npm workspaces.
  * **Frontend:**
      * React 19 (Vite + SWC)
      * TypeScript
      * Tailwind CSS (styling)
      * TanStack Query (`@tanstack/react-query`) for server state management.
      * `@hello-pangea/dnd` for the drag-and-drop interface.
  * **Backend:**
      * Node.js
      * Express (routing and middleware)
      * TypeScript
      * `jsonwebtoken` (JWTs for auth)
      * `bcryptjs` (password hashing)
  * **Database:**
      * PostgreSQL
      * `pg_vector` (vector storage and similarity search)
      * `node-postgres` (`pg`) as the database driver.

## Getting Started (Local Development)

### Prerequisites

  * Node.js (v18+)
  * npm (v9+) or a compatible package manager.
  * A running PostgreSQL (v16+) instance.
  * A TMDB API Key (for the database seed script).

### 1\. Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/lucas-queiroz-sena2005/kindred.git
cd kindred

# 2. Install all dependencies from the root directory
npm install
```

### 2\. Backend Setup

1.  **Navigate to the backend:**
    ```bash
    cd backend
    ```
2.  **Set up PostgreSQL:**
      * Create a user and a database.
      * **Important:** You must install/enable the `vector` extension. If running Postgres locally (not in Docker), you may need to run `sudo apt install postgresql-16-pgvector`.
3.  **Create `.env` file:**
      * Create a `.env` file in the `backend/` directory.
      * Copy the contents of `.env.example` (if one exists) or use the structure below.
4.  **Run Database Schema:**
      * Use a psql client to run the `database.sql` file against your new database. This will create all tables, views, and indexes.
    ```bash
    psql "YOUR_DATABASE_URL" < database.sql
    ```
5.  **Seed the Database (Optional but Recommended):**
      * This script fetches data from TMDB and populates the `movies`, `directors`, and `genres` tables.
    ```bash
    npm run seed
    ```
6.  **Run the Backend Server:**
    ```bash
    npm run dev
    ```
    The server will be running at `http://localhost:3001`.

### 3\. Frontend Setup

1.  **Navigate to the frontend:**
    ```bash
    cd frontend
    ```
2.  **Run the Frontend App:**
    ```bash
    npm run dev
    ```
    The app will be running at `http://localhost:5173`.

## Environment Variables

The backend requires a `.env` file in `/backend`.

```.env
# Example .env file

# URL for the PostgreSQL database.
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/YOUR_DB_NAME"

# A strong, random string for signing JWTs.
JWT_SECRET="YOUR_SUPER_SECRET_KEY"

# API key from The Movie Database (TMDB) for the seed script.
TMDB_API_KEY="YOUR_TMDB_KEY"
```

-----

## Available Scripts

### Backend (`/backend`)

  * `npm run dev`: Starts the dev server with `ts-node-dev`.
  * `npm run build`: Compiles TypeScript to JavaScript.
  * `npm run start`: Runs the compiled JavaScript (for production).
  * `npm run seed`: Runs the `backend/db/seed.ts` script to populate the database.

### Frontend (`/frontend`)

  * `npm run dev`: Starts the Vite dev server.
  * `npm run build`: Builds the app for production.
  * `npm run preview`: Previews the production build locally.

-----

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

<a id="-português"></a>
## 🇧🇷 Português

### Kindred (Versão em Português)

Uma aplicação web full-stack que quantifica o "gosto" do usuário e descobre usuários compatíveis através de um algoritmo de similaridade de vetores baseado em características.

## Demonstração ao Vivo & Capturas de Tela

*   **Aplicação ao Vivo:** [Link para o seu site no Render/Vercel]

## Funcionalidades

*   **Interface de Classificação de Modo Duplo:** Experimente um processo de classificação contínuo com uma interface fluida de **arrastar e soltar** (drag-and-drop) no desktop e um sistema intuitivo de **tocar para classificar** (tap-to-rank) no mobile. O design responsivo garante uma ótima experiência em qualquer dispositivo.
*   **Autenticação Segura e Moderna:** Sua conta é protegida com um sistema de autenticação robusto usando JWTs, que são armazenados de forma segura em cookies `httpOnly` para prevenir vulnerabilidades web comuns.
*   **Listas de Tiers Persistentes e Compartilháveis:** Nunca perca seu trabalho. Todas as suas classificações são salvas automaticamente no seu perfil e podem ser revisitadas e atualizadas a qualquer momento.
*   **Descubra seus "Kin":** Vá além de simples classificações e encontre usuários que realmente compartilham seus gostos cinematográficos. A página "Kin" apresenta uma lista ordenada de usuários com base em uma pontuação profunda de similaridade de "DNA de gosto".
*   **O Algoritmo "DNA de Gosto":** A principal inovação do projeto. Em vez de apenas comparar filme por filme, ele analisa suas preferências entre gêneros, diretores e décadas para construir um perfil vetorial único do seu gosto, permitindo uma correspondência de usuários mais significativa.

## Conceito Principal: O Algoritmo "DNA de Gosto"

Em vez de apenas conectar você com pessoas que gostam dos mesmos filmes, o Kindred tenta entender a *essência* do seu gosto — os gêneros, diretores e épocas que te atraem. Em seguida, ele encontra outros usuários que compartilham esse mesmo "DNA de Gosto" subjacente, mesmo que vocês não tenham classificado o mesmo conjunto de filmes.

Isso é alcançado através de um sistema de duas partes:

### 1\. O Caminho de Escrita (Calculando o Vetor)

Quando um usuário salva uma tier list, uma função `recalculateProfileVector` do tipo "dispare e esqueça" é acionada no backend.

1.  **Coleta de Dados:** O serviço busca *todos* os itens que o usuário já classificou.
2.  **Mapeamento:** A tier de cada item (S-F) é mapeada para uma pontuação (ex: `S: +3`, `A: +2`, `F: -2`).
3.  **Agregação:** O sistema agrega essas pontuações para cada *característica* associada aos itens (ex: `Ação`, `Anos 90`, `Christopher Nolan`).
4.  **Encolhimento (Média Bayesiana):** Para evitar vieses de baixa contagem (ex: classificar um único filme de "Ação" como "S"), a pontuação final de afinidade para cada característica é calculada usando uma fórmula de "amortecimento":
    `afinidade = pontuacaoTotal / (k + contagem)`
      * `pontuacaoTotal`: A soma das pontuações para uma característica (ex: `+25` para "Ação").
      * `contagem`: O número de itens de "Ação" classificados.
      * `k`: Um fator de amortecimento fixo (ex: `3`).
5.  **Armazenamento:** O `vetor(256)` final é salvo na tabela `users`.

### 2\. O Caminho de Leitura (Encontrando Usuários Similares)

Quando um usuário visita a página "Kin", o backend executa uma busca rápida e indexada.

1.  **Métrica:** A similaridade é definida pela `Similaridade de Cosseno`, que mede o *ângulo* entre dois vetores de perfil, ignorando a magnitude.
2.  **Banco de Dados:** PostgreSQL com a extensão `pg_vector`.
3.  **Consulta:** Usamos o operador `<=>` (Distância de Cosseno).
4.  **Desempenho:** A busca é quase instantânea (mesmo com milhões de usuários) usando um índice `ivfflat` (Inverted File Flat) na coluna `profile_vector`.

## Tecnologias Utilizadas

  * **Monorepo:** Gerenciado com npm workspaces.
  * **Frontend:**
      * React 19 (Vite + SWC)
      * TypeScript
      * Tailwind CSS (estilização)
      * TanStack Query (`@tanstack/react-query`) para gerenciamento de estado do servidor.
      * `@hello-pangea/dnd` para a interface de arrastar e soltar.
  * **Backend:**
      * Node.js
      * Express (roteamento e middleware)
      * TypeScript
      * `jsonwebtoken` (JWTs para autenticação)
      * `bcryptjs` (hashing de senhas)
  * **Banco de Dados:**
      * PostgreSQL
      * `pg_vector` (armazenamento de vetores e busca por similaridade)
      * `node-postgres` (`pg`) como o driver do banco de dados.

## Começando (Desenvolvimento Local)

### Pré-requisitos

  * Node.js (v18+)
  * npm (v9+) ou um gerenciador de pacotes compatível.
  * Uma instância do PostgreSQL (v16+) em execução.
  * Uma Chave de API do TMDB (para o script de seed do banco de dados).

### 1\. Configuração Inicial

```bash
# 1. Clone o repositório
git clone https://github.com/lucas-queiroz-sena2005/kindred.git
cd kindred

# 2. Instale todas as dependências a partir do diretório raiz
npm install
```

### 2\. Configuração do Backend

1.  **Navegue até o backend:**
    ```bash
    cd backend
    ```
2.  **Configure o PostgreSQL:**
      * Crie um usuário e um banco de dados.
      * **Importante:** Você deve instalar e habilitar a extensão `vector`. Se estiver executando o Postgres localmente (não em Docker), pode ser necessário executar `sudo apt install postgresql-16-pgvector`. Depois, conecte-se ao seu banco de dados e execute `CREATE EXTENSION vector;`.
3.  **Crie o arquivo `.env`:**
      * Crie um arquivo `.env` no diretório `backend/`.
      * Use a estrutura fornecida na seção "Variáveis de Ambiente" abaixo.
4.  **Execute o Schema do Banco de Dados:**
      * Use um cliente `psql` para executar o arquivo `database.sql` (localizado em `/backend/db/`) no seu novo banco de dados. Isso criará todas as tabelas, views e índices.
    ```bash
    psql "SUA_URL_DO_BANCO_DE_DADOS" < ./db/database.sql
    ```
5.  **Popule o Banco de Dados (Opcional, mas Recomendado):**
      * Este script busca dados do TMDB e popula as tabelas `movies`, `directors` e `genres`.
    ```bash
    npm run seed # Deve ser executado a partir do diretório /backend
    ```
6.  **Execute o Servidor Backend:**
    ```bash
    npm run dev # Deve ser executado a partir do diretório /backend
    ```
    O servidor estará rodando em `http://localhost:3001`.

### 3\. Configuração do Frontend

1.  **Navegue até o frontend:**
    ```bash
    cd frontend
    ```
2.  **Execute a Aplicação Frontend:**
    ```bash
    npm run dev # Deve ser executado a partir do diretório /frontend
    ```
    A aplicação estará rodando em `http://localhost:5173`.

## Variáveis de Ambiente

O backend requer um arquivo `.env` em `/backend`.

```dotenv
# Exemplo de arquivo .env

# URL para o banco de dados PostgreSQL.
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/SEU_BANCO_DE_DADOS"

# Uma string forte e aleatória para assinar os JWTs.
JWT_SECRET="SUA_CHAVE_SUPER_SECRETA"

# Chave de API do The Movie Database (TMDB) para o script de seed.
TMDB_API_KEY="SUA_CHAVE_TMDB"
```

## Scripts Disponíveis

### Backend (`/backend`)

  * `npm run dev`: Inicia o servidor de desenvolvimento com `ts-node-dev`.
  * `npm run build`: Compila o TypeScript para JavaScript.
  * `npm run start`: Executa o JavaScript compilado (para produção).
  * `npm run seed`: Executa o script `backend/db/seed.ts` para popular o banco de dados.

### Frontend (`/frontend`)

  * `npm run dev`: Inicia o servidor de desenvolvimento do Vite.
  * `npm run build`: Constrói a aplicação para produção.
  * `npm run preview`: Pré-visualiza a build de produção localmente.

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
