const cookieName = "restoran_admin";
const encoder = new TextEncoder();
function b64(bytes) { return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_"); }
function unb64(s) { s=s.replace(/-/g,"+").replace(/_/g,"/"); return Uint8Array.from(atob(s+"=".repeat((4-s.length%4)%4)),c=>c.charCodeAt(0)); }
async function sign(value, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["sign","verify"]);
  return b64(await crypto.subtle.sign("HMAC",key,encoder.encode(value)));
}
async function valid(request, env) {
  const cookie = (request.headers.get("Cookie")||"").split(";").map(s=>s.trim()).find(s=>s.startsWith(cookieName+"="));
  if (!cookie || !env.SESSION_SECRET) return false;
  const token=cookie.slice(cookieName.length+1), parts=token.split(".");
  if(parts.length!==2) return false;
  const [payload,sig]=parts;
  try {
    const expected=await sign(payload,env.SESSION_SECRET);
    const a=encoder.encode(sig),b=encoder.encode(expected);
    if(a.length!==b.length || !crypto.subtle.timingSafeEqual) {
      if(a.length!==b.length) return false;
      let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];if(diff!==0)return false;
    } else if(!crypto.subtle.timingSafeEqual(a,b)) return false;
    const data=JSON.parse(new TextDecoder().decode(unb64(payload)));
    return data.exp>Date.now();
  } catch { return false; }
}
function json(data,status=200,headers={}) { return Response.json(data,{status,headers}); }
function cookie(value,maxAge) { return `${cookieName}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=${maxAge}`; }
export async function onRequest({request,env,params}) {
  const path=(params.path||[]).join("/");
  const method=request.method;
  if(path==="login" && method==="POST") {
    let body;try{body=await request.json()}catch{return json({error:"Data login tidak valid"},400)}
    if(!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD || !env.SESSION_SECRET) return json({error:"Kredensial admin belum disetel di Cloudflare."},500);
    if(body.username!==env.ADMIN_USERNAME || body.password!==env.ADMIN_PASSWORD) return json({error:"Username atau password salah."},401);
    const payload=b64(encoder.encode(JSON.stringify({u:env.ADMIN_USERNAME,exp:Date.now()+8*60*60*1000})));
    const token=payload+"."+await sign(payload,env.SESSION_SECRET);
    return json({ok:true},200,{ "Set-Cookie":cookie(token,8*60*60) });
  }
  if(path==="logout" && method==="POST") return json({ok:true},200,{"Set-Cookie":cookie("",0)});
  if(path==="me" && method==="GET") return await valid(request,env)?json({ok:true}):json({error:"Belum login"},401);
  if(!await valid(request,env)) return json({error:"Sesi admin tidak valid. Silakan login kembali."},401);
  if(!env.DB) return json({error:"Database D1 belum terhubung."},500);

  if(path==="menu" && method==="GET") {
    const {results}=await env.DB.prepare("SELECT * FROM menu_items ORDER BY id DESC").all();return json(results);
  }
  if(path==="menu" && method==="POST") {
    const b=await request.json(),name=String(b.name||"").trim();
    const price=Math.floor(Number(b.price));
    if(!name||!Number.isFinite(price)||price<0) return json({error:"Nama dan harga menu wajib valid."},400);
    const r=await env.DB.prepare("INSERT INTO menu_items(name,description,category,price,image_url,available) VALUES(?,?,?,?,?,?)")
      .bind(name.slice(0,120),String(b.description||"").slice(0,500),String(b.category||"Makanan").slice(0,50),price,String(b.image_url||"").slice(0,1000),b.available?1:0).run();
    return json({id:r.meta.last_row_id,ok:true},201);
  }
  let match=path.match(/^menu\/(\d+)$/);
  if(match && method==="PUT") {
    const b=await request.json(),price=Math.floor(Number(b.price)),name=String(b.name||"").trim();
    if(!name||!Number.isFinite(price)||price<0) return json({error:"Nama dan harga menu wajib valid."},400);
    await env.DB.prepare("UPDATE menu_items SET name=?,description=?,category=?,price=?,image_url=?,available=? WHERE id=?")
      .bind(name.slice(0,120),String(b.description||"").slice(0,500),String(b.category||"Makanan").slice(0,50),price,String(b.image_url||"").slice(0,1000),b.available?1:0,Number(match[1])).run();
    return json({ok:true});
  }
  if(match && method==="DELETE") { await env.DB.prepare("DELETE FROM menu_items WHERE id=?").bind(Number(match[1])).run();return json({ok:true}); }
  if(path==="orders" && method==="GET") { const {results}=await env.DB.prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 300").all();return json(results); }
  match=path.match(/^orders\/(\d+)$/);
  if(match && method==="PATCH") {
    const b=await request.json(),allowed=["Menunggu","Diproses","Siap diambil","Dalam pengantaran","Selesai","Dibatalkan"];
    if(!allowed.includes(b.status))return json({error:"Status tidak valid."},400);
    await env.DB.prepare("UPDATE orders SET status=? WHERE id=?").bind(b.status,Number(match[1])).run();return json({ok:true});
  }
  return json({error:"Endpoint tidak ditemukan."},404);
}
