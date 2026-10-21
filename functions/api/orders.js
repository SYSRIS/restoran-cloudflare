export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const name = String(body.customer_name || "").trim().slice(0,120);
    const phone = String(body.phone || "").trim().slice(0,40);
    const address = String(body.address || "").trim().slice(0,1000);
    const notes = String(body.notes || "").trim().slice(0,1000);
    const payment = String(body.payment_method || "Bayar saat diterima").slice(0,80);
    if (!name || !phone || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50)
      return Response.json({ error: "Nama, telepon, dan item pesanan wajib diisi." }, { status: 400 });
    let total = 0, clean = [];
    for (const item of body.items) {
      const id = Number(item.id), quantity = Math.floor(Number(item.quantity));
      if (!Number.isInteger(id) || quantity < 1 || quantity > 50) return Response.json({ error: "Item pesanan tidak valid." }, { status: 400 });
      const menu = await env.DB.prepare("SELECT id,name,price,available FROM menu_items WHERE id=?").bind(id).first();
      if (!menu || !menu.available) return Response.json({ error: "Ada menu yang sudah tidak tersedia. Muat ulang halaman." }, { status: 400 });
      total += Number(menu.price) * quantity;
      clean.push({ id: menu.id, name: menu.name, price: Number(menu.price), quantity });
    }
    if (total > 100000000) return Response.json({ error: "Total pesanan terlalu besar." }, { status: 400 });
    const result = await env.DB.prepare("INSERT INTO orders (customer_name,phone,address,notes,items_json,total,payment_method,status) VALUES (?,?,?,?,?,?,?,'Menunggu')")
      .bind(name,phone,address,notes,JSON.stringify(clean),total,payment).run();
    return Response.json({ id: result.meta.last_row_id, total }, { status: 201 });
  } catch { return Response.json({ error: "Pesanan gagal disimpan." }, { status: 500 }); }
}
