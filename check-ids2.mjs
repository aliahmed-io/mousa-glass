import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";
import { products } from "./drizzle/schema.ts";

dotenv.config({ path: ".env.local" });
const db = drizzle(process.env.DATABASE_URL);
const rows = await db.select({ id: products.id, name: products.nameAr }).from(products).limit(5);
console.log(JSON.stringify(rows));
