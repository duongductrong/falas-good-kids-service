import { config } from "dotenv"
import { DataSource, DataSourceOptions } from "typeorm"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"

config()

export const databaseOptions: DataSourceOptions = {
  url: process.env.DATABASE_URL!,
  port: Number(process.env.DATABASE_PORT) || 5432,
  host: process.env.DATABASE_HOST,
  type: process.env.DATABASE_TYPE as "postgres",
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ["dist/src/modules/**/*.entity{.ts,.js}"],
  migrations: ["dist/src/database/migrations/*{.ts,.js}"],
  subscribers: ["dist/src/modules/**/*.subscriber{.ts,.js}"],
  synchronize: process.env.DATABASE_SYNC === "true",
  migrationsTableName: process.env.DATABASE_MIGRATION || "migrations",
  namingStrategy: new SnakeNamingStrategy(),
}

const dataSource = new DataSource(databaseOptions)

export default dataSource
