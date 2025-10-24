## Documento de Arquitetura Técnica: Algoritmo de Similaridade de Vetor

### 1\. Visão Geral

O objetivo deste documento é detalhar a arquitetura e a implementação do algoritmo de descoberta de usuários ("Kin"), que se baseia na quantificação e comparação do perfil de gosto (`taste DNA`) de cada usuário.

A arquitetura é dividida em dois processos distintos e assíncronos:

1.  **Processo de Escrita (Write Path)**: Um recálculo síncrono do vetor de afinidade do usuário, disparado por uma ação de escrita (salvar `tierlist`).
2.  **Processo de Leitura (Read Path)**: Uma consulta de similaridade assíncrona, disparada por uma ação de leitura (visitar a página "Kin").

A premissa central é que o trabalho computacionalmente caro (cálculo do vetor) é feito durante a **escrita**, para que a **leitura** (busca de similaridade) seja quase instantânea.

### 2\. Estrutura de Dados Central: `profile_vector`

A base de todo o sistema é uma única coluna na tabela `users`.

  * **Tabela**: `users`
  * **Coluna**: `profile_vector`
  * **Tipo de Dados (SQL)**: `VECTOR(256)`
      * Requer a extensão PostgreSQL `pg_vector` (`CREATE EXTENSION vector;`).
      * O tamanho `N=256` é fixo e alocado para crescimento futuro.

#### 2.1. Mapeamento de Features (Feature Map)

O vetor `profile_vector` de 256 dimensões é um *array* onde cada índice corresponde a uma *feature* de metadados predefinida. Esta correspondência é gerenciada no *backend* por um objeto de configuração (`featureMap.ts`).

**Composição de Dimensões (N=256):**

  * **Índices 0-18 (19 Dimensões)**: Gêneros (`'sci-fi'`, `'drama'`, `'comedy'`, etc.)
  * **Índices 19-29 (11 Dimensões)**: Décadas (`'1980s'`, `'1990s'`, `'2000s'`, etc.)
  * **Índices 30-255 (226 Dimensões)**: Diretores (`'christopher-nolan'`, `'denis-villeneuve'`, etc.)

**Exemplo de Mapeamento:**

```typescript
// backend/config/featureMap.ts
export const VECTOR_DIMENSION = 256;
export const FEATURE_MAP = {
  'sci-fi': 0,
  'drama': 1,
  // ...
  '1990s': 20,
  '2000s': 21,
  // ...
  'christopher-nolan': 30,
  'denis-villeneuve': 31,
  // ... (Índices 32-255 são reservados)
};
```

-----

### 3\. Processo de Escrita: Cálculo do `profile_vector`

Este processo recalcula o vetor de afinidade de um usuário do zero.

#### 3.1. Gatilho (Trigger)

  * **Evento**: Requisição `POST /api/tierlist/:templateId`.
  * **Timing**: Síncrono, executado no *backend* após a lógica de `tierlistService` salvar os `ranked_items` no banco de dados, mas antes da resposta `200 OK` ser enviada ao cliente.

#### 3.2. Localização da Lógica

A lógica de recálculo reside na camada de aplicação (Backend/Service), não em um *trigger* de banco de dados (`pl/pgsql`). Isso é necessário porque a lógica depende do `FEATURE_MAP` e de regras de negócios (o `k_DAMPENING_FACTOR`) que pertencem à aplicação.

#### 3.3. Algoritmo de Recálculo (`recalculateProfileVector`)

1.  **Definição de Constantes**:

      * `tier_weights = { S: 3, A: 2, B: 1, C: 0, D: -1, F: -2 }`
      * `k_DAMPENING_FACTOR = 3` (Fator de amortecimento para a Média Bayesiana)
      * `N = 256` (Dimensão do Vetor)

2.  **Busca de Dados**: Executar uma consulta SQL para buscar *todos* os `ranked_items` do `user_id` e suas *features* associadas (via `vw_movie_features`).

3.  **Agregação em Memória**: Inicializar dois vetores zerados no *backend*:

      * `total_score_vector: number[N]`
      * `feature_count_vector: number[N]`

4.  **Iteração**: Para cada `ranked_item` retornado do banco de dados:
    a. Obter o `tier_weight` (ex: 'S' -\> `+3`).
    b. Obter as *features* do item (ex: `['sci-fi', '2010s', 'christopher-nolan']`).
    c. Para cada *feature* no item:
    i. Encontrar o `index` correspondente no `FEATURE_MAP` (ex: 'sci-fi' -\> `0`).
    ii. Atualizar os vetores de agregação:
    `total_score_vector[index] += tier_weight;`
    `feature_count_vector[index] += 1;`

5.  **Cálculo de Afinidade (Média Bayesiana)**:
    a. Inicializar `new_profile_vector: number[N]`.
    b. Iterar de `i = 0` até `N-1`:
    i. `count = feature_count_vector[i]`
    ii. `totalScore = total_score_vector[i]`
    iii. Aplicar a fórmula de *shrinkage* (amortecimento) para mitigar o viés de baixa contagem:
    **`new_profile_vector[i] = totalScore / (k_DAMPENING_FACTOR + count)`**
    *(Nota: Se `count` for 0, o `totalScore` também será 0, resultando em `0 / 3 = 0`, o que é neutro e correto.)*

6.  **Persistência**: Executar um único comando `UPDATE` para salvar o vetor final:

    ```sql
    UPDATE users
    SET profile_vector = '[...new_profile_vector...]' -- Formato de string do pg_vector
    WHERE user_id = :userId;
    ```

-----

### 4\. Processo de Leitura: Busca por Similaridade

Este processo encontra os vizinhos mais próximos de um usuário sob demanda.

#### 4.1. Gatilho (Trigger)

  * **Evento**: Requisição `GET /api/kin`.
  * **Timing**: Assíncrono e sob demanda, quando o usuário visita a página de descoberta.

#### 4.2. Algoritmo de Comparação: `Cosine Similarity`

Utilizamos a **Similaridade de Cosseno** como métrica de comparação.

  * **Fórmula Matemática**: `Similarity(A, B) = cos(θ) = (A · B) / (||A|| * ||B||)`
  * **Justificativa**: Esta métrica mede o *ângulo* entre dois vetores, ignorando sua *magnitude*. Isso é crucial, pois um usuário que avaliou 1000 filmes (vetor de alta magnitude) não deve ser inerentemente diferente de um usuário que avaliou 100 filmes (vetor de baixa magnitude), se a *proporção* de seus gostos for a mesma.
  * **Implementação `pg_vector`**: A extensão fornece o operador `<=>` (Distância de Cosseno).
      * `Distância de Cosseno = 1 - Similaridade de Cosseno`
      * Portanto: **`Similaridade = 1 - (vector_A <=> vector_B)`**

#### 4.3. Otimização de Leitura: Índice ANN

Uma consulta de similaridade em `N` usuários (`SELECT ... ORDER BY ... <=> ...`) executaria um *Sequential Scan*, resultando em `O(N)` de complexidade. Isso é inviável.

**Solução**: Criamos um **Índice ANN (Approximate Nearest Neighbor)** na coluna `profile_vector`.

  * **Comando DDL (Exemplo `IVFFlat`)**:
    ```sql
    CREATE INDEX ON users
    USING ivfflat (profile_vector vector_cosine_ops)
    WITH (lists = 100); -- O nº de 'lists' é um parâmetro de ajuste.
    ```
  * **Trade-off**:
      * **Escrita (Write)**: O `UPDATE` da Parte 3 torna-se mais lento, pois o banco de dados precisa atualizar o índice `ivfflat`.
      * **Leitura (Read)**: A consulta de busca torna-se logarítmica ou sublinear, permitindo resultados quase instantâneos.

#### 4.4. Query de Leitura (Exemplo)

O *backend* (`kinService`) executará a seguinte consulta, que é otimizada pelo índice:

```sql
-- :target_user_id = UUID do usuário que está buscando
-- :target_vector = O profile_vector desse usuário (buscado em uma subconsulta)

SELECT
  other.user_id,
  other.username,
  (1 - (other.profile_vector <=> (
    SELECT profile_vector
    FROM users
    WHERE user_id = :target_user_id
  ))) AS similarity_score
FROM
  users AS other
WHERE
  other.user_id != :target_user_id
  AND other.profile_vector IS NOT NULL
-- O 'ORDER BY' utiliza o índice ANN para encontrar os vizinhos mais próximos
ORDER BY
  other.profile_vector <=> (
    SELECT profile_vector
    FROM users
    WHERE user_id = :target_user_id
  )
LIMIT 10;
```