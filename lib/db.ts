import { neon } from "@neondatabase/serverless"
import { auth } from "@clerk/nextjs/server";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const sql = neon(process.env.DATABASE_URL)

export async function getAuthenticatedSql() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }
    await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);
    return sql;
}

export { sql }
