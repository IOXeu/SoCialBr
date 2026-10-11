-- SoCialBr D1 schema limpo + whatsapp + foto + tema
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS bans;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS invites;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS grupos;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  whatsapp TEXT,
  foto_perfil TEXT,
  foto_capa TEXT,
  tema_atual TEXT NOT NULL DEFAULT 'original',
  telegram_id TEXT,
  criado_em INTEGER NOT NULL
);
CREATE TABLE grupos(
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  dono_id TEXT NOT NULL REFERENCES users(id),
  criado_em INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  despedida_ate INTEGER
);
CREATE TABLE members(
  group_id TEXT NOT NULL REFERENCES grupos(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  invited_by TEXT REFERENCES users(id),
  entrou_em INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  despedida_ate INTEGER,
  despedida_por TEXT,
  PRIMARY KEY(group_id,user_id)
);
CREATE TABLE invites(
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES grupos(id),
  invited_by TEXT NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL UNIQUE,
  expira_em INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'novo',
  usado_por TEXT
);
CREATE TABLE posts(
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES grupos(id),
  author_id TEXT NOT NULL REFERENCES users(id),
  conteudo_cifrado TEXT NOT NULL,
  criado_em INTEGER NOT NULL
);
CREATE TABLE bans(user_id TEXT, fim INTEGER);
CREATE TABLE audit_log(evento TEXT, ator TEXT, alvo TEXT, quando INTEGER);
CREATE INDEX idx_members_user ON members(user_id);
CREATE INDEX idx_posts_group ON posts(group_id, criado_em DESC);
CREATE INDEX idx_users_whatsapp ON users(whatsapp);
