import { PoolClient } from "pg";
import { buildBulkInsertPlaceholders } from "./utils.js";

export async function seedUserConnections(client: PoolClient, userIds: number[]) {
  console.log("--- Seeding user connections ---");
  const [user1, user2, user3] = userIds;
  // testuser is connected to user2 and user3
  const connections = [
    [user1, user2],
    [user1, user3],
  ];

  const values = connections.map(([idA, idB]) =>
    idA < idB ? [idA, idB] : [idB, idA],
  );

  const placeholders = buildBulkInsertPlaceholders(values.length, 2);
  const query = `--sql
    INSERT INTO user_connections (user_id_a, user_id_b)
    VALUES ${placeholders}
    ON CONFLICT (user_id_a, user_id_b) DO NOTHING
  `;

  await client.query(query, values.flat());
  console.log(`Seeded ${values.length} user connections.`);
}
