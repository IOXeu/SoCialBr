// SoCialBR API v2 LIMPA - só une pessoas, não vende
const MAX_MEMBROS_GRUPO = 100;
const DESPEDIDA_DIAS = 30, CONVITE_DIAS = 7, DIA = 864e5;
const CODIGOS_COMUNIDADE = ['CONVITEBR','BRASIL','SOCIALBR'];

const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json' } });
const E = (m, s = 400) => J({ erro: m }, s);
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const rnd = () => hex(crypto.getRandomValues(new Uint8Array(24)));
const sha = async t => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)));

export async function onRequest({ request, env }) {
  const db = env.DB;
  const p = new URL(request.url).pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean), m = request.method, now = Date.now();
  const body = m === 'POST' || m === 'PUT'? await request.json().catch(() => ({})) : {};

  if (p[0] === 'registrar' && m === 'POST') {
    const nome = String(body.nome || '').trim().slice(0, 40); if (!nome) return E('Diga seu nome');
    const whatsapp = String(body.whatsapp || '').trim().slice(0,20) || null;
    const id = rnd(), token = rnd();
    await db.prepare('INSERT INTO users(id,nome,token_hash,whatsapp,tema_atual,criado_em) VALUES(?,?,?,?,?,?)')
     .bind(id, nome, await sha(token), whatsapp, 'original', now).run();
    return J({ token, id, nome });
  }

  const tk = (request.headers.get('authorization') || '').replace('Bearer ', '');
  const me = tk? await db.prepare('SELECT id,nome,whatsapp,foto_perfil,foto_capa,tema_atual FROM users WHERE token_hash=?').bind(await sha(tk)).first() : null;
  if (!me) return E('Entre primeiro', 401);

  if (p[0] === 'eu') return J(me);

  if (p[0] === 'perfil' && (m === 'PUT' || m === 'POST')) {
    await db.prepare(`UPDATE users SET whatsapp=COALESCE(?,whatsapp), foto_perfil=COALESCE(?,foto_perfil), foto_capa=COALESCE(?,foto_capa), tema_atual=COALESCE(?,tema_atual) WHERE id=?`)
     .bind(body.whatsapp?.slice(0,20)||null, body.foto_perfil?.slice(0,500000)||null, body.foto_capa?.slice(0,500000)||null, body.tema_atual?.slice(0,30)||null, me.id).run();
    return J(await db.prepare('SELECT id,nome,whatsapp,foto_perfil,foto_capa,tema_atual FROM users WHERE id=?').bind(me.id).first());
  }

  if (p[0] === 'grupos' &&!p[1]) {
    if (m === 'GET') return J((await db.prepare(`SELECT g.id,g.nome,g.status FROM members m JOIN grupos g ON g.id=m.group_id WHERE m.user_id=?`).bind(me.id).all()).results);
    const nome = String(body.nome||'').trim().slice(0,50); if(!nome) return E('Diga o nome');
    const tipo = body.tipo === 'comunidade'? 'comunidade' : 'grupo';
    if(tipo==='comunidade' &&!CODIGOS_COMUNIDADE.includes(String(body.codigo_convite||'').toUpperCase())) return E('Código COMUNIDADE inválido',403);
    const id = rnd();
    await db.batch([db.prepare('INSERT INTO grupos(id,nome,dono_id,criado_em,status) VALUES(?,?,?,?,?)').bind(id, nome, me.id, now, tipo), db.prepare('INSERT INTO members(group_id,user_id,entrou_em) VALUES(?,?,?)').bind(id, me.id, now)]);
    return J({ id, tipo });
  }
  return E('Rota nao encontrada',404);
}
