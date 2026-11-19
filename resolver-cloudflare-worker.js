// Resolvedor OPCIONAL de links curtos do Google Maps (Cloudflare Workers, plano gratuito).
// Segue os redireccionamentos de maps.app.goo.gl / goo.gl/maps / g.co/kgs e devolve o URL final em JSON: {"url": "..."}.
// Só aceita esses domínios (não é um proxy aberto).
// Depois de publicar, cole o endereço do Worker em MAP_RESOLVER no index.html. Ex.: const MAP_RESOLVER='https://SEU-WORKER.SEU-UTILIZADOR.workers.dev';
export default {
  async fetch(req) {
    const h = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
    try {
      const u = new URL(new URL(req.url).searchParams.get('u'));
      if (!/^(maps\.app\.goo\.gl|goo\.gl|g\.co)$/.test(u.hostname)) {
        return new Response('{"error":"dominio nao permitido"}', { status: 400, headers: h });
      }
      let cur = u.href;
      for (let i = 0; i < 6; i++) {
        const r = await fetch(cur, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0' } });
        const loc = r.headers.get('location');
        if (!loc) break;
        cur = new URL(loc, cur).href;
        if (/google\.[a-z.]+\/maps/.test(cur)) break;
      }
      return new Response(JSON.stringify({ url: cur }), { headers: h });
    } catch (e) {
      return new Response('{"error":"falha"}', { status: 500, headers: h });
    }
  }
};
