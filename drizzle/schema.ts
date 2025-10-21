import { mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date, int } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Movimentações financeiras (receitas e despesas)
 * Sincronizadas com Supabase dmovimentacoes
 */
export const movimentacoes = mysqlTable("movimentacoes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  data: date("data").notNull(),
  rubrica: varchar("rubrica", { length: 255 }).notNull(),
  banco: varchar("banco", { length: 255 }),
  pagador: varchar("pagador", { length: 255 }),
  valor: decimal("valor", { precision: 12, scale: 2 }).notNull(),
  cod_rubrica: varchar("cod_rubrica", { length: 64 }),
  descricao: text("descricao"),
  parcelas: int("parcelas").default(1),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Movimentacao = typeof movimentacoes.$inferSelect;
export type InsertMovimentacao = typeof movimentacoes.$inferInsert;

/**
 * Rubricas (categorias de movimentações)
 * Sincronizadas com Supabase dplanodecontas
 */
export const rubricas = mysqlTable("rubricas", {
  id: varchar("id", { length: 64 }).primaryKey(),
  codigo: varchar("codigo", { length: 64 }).notNull(),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 64 }), // RECEITA, DESPESA, etc
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Rubrica = typeof rubricas.$inferSelect;
export type InsertRubrica = typeof rubricas.$inferInsert;
