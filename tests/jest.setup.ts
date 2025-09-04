import dotenv from "dotenv";
import { Pool } from "pg";
import Redis from "ioredis";

// Carrega variáveis de ambiente baseado no NODE_ENV
const envFile = process.env.NODE_ENV === 'ci.containers'
  ? '.env.ci.containers'
  : process.env.NODE_ENV === 'ci.services'
  ? '.env.ci.services'
  : '.env.test';
console.log(`Usando arquivo de variáveis de ambiente: ${envFile}`);
dotenv.config({ path: envFile });

beforeAll(async () => {
  // Conectar ao PostgreSQL
  global.pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  await global.pool.query("SELECT 1");

  // Conectar ao Redis
  global.redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD 
  });
  await global.redis.ping();
});

beforeEach(async () => {
  // Limpa tabela a cada teste
  await global.pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE;");
  await global.redis.flushall();
});

afterEach(async () => {
  // Limpa tabela e Redis após cada teste
  await global.pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE;");
  await global.redis.flushall();
});

afterAll(async () => {
  await global.pool.end();
  await global.redis.quit();
  jest.restoreAllMocks();
});
