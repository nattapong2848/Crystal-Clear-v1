/* Crystal Clear Back Office - GitHub Pages Full UI */
const CONFIG = window.CRYSTAL_CONFIG || {};
const STORE_KEY = "crystal_clear_backoffice_v2";

const STATUS = [
  { key:"NEW_ORDER", label:"ลูกค้ากดสั่ง", tone:"blue", progress:8, group:"pending" },
  { key:"SEND_IMPRESSION_KIT", label:"ส่งชุดพิมพ์ให้ลูกค้า", tone:"gold", progress:16, group:"pending" },
  { key:"WAITING_IMPRESSION_RETURN", label:"รอพิมพ์ฟันส่งกลับ", tone:"orange", progress:26, group:"waiting" },
  { key:"IMPRESSION_RECEIVED", label:"ได้รับแบบพิมพ์แล้ว", tone:"blue", progress:38, group:"working" },
  { key:"IMPRESSION_FAILED_REPRINT", label:"พิมพ์ไม่ผ่าน ต้องส่งชุดใหม่", tone:"red", progress:24, group:"problem" },
  { key:"PLASTER_MODEL", label:"เทปูนขึ้นรูป", tone:"purple", progress:52, group:"working" },
  { key:"FORMING_RETAINER", label:"ขึ้นรูปรีเทนเนอร์", tone:"purple", progress:68, group:"working" },
  { key:"QC_CHECK", label:"ตรวจงาน QC", tone:"gold", progress:78, group:"working" },
  { key:"READY_TO_SEND", label:"พร้อมส่งคืนลูกค้า", tone:"green", progress:88, group:"ready" },
  { key:"SENT_TO_CUSTOMER", label:"ส่งคืนลูกค้าแล้ว", tone:"green", progress:96, group:"ready" },
  { key:"CLOSED", label:"ปิดงาน", tone:"gray", progress:100, group:"done" },
  { key:"CANCELLED", label:"ยกเลิก", tone:"gray", progress:0, group:"done" }
];
const STATUS_LABELS = STATUS.map(s => s.label);

const COST_TYPES = ["ชุดผงพิมพ์/ถาดพิมพ์", "ค่าส่งชุดพิมพ์ไปลูกค้า", "ค่าส่งพิมพ์กลับ", "ต้นทุนปูน/วัสดุเทแบบ", "วัสดุขึ้นรูปรีเทนเนอร์", "กล่อง/แพ็กเกจ", "ต้นทุนพิมพ์ใหม่/ทำใหม่", "อื่น ๆ"];
const MEDIA_TYPES = ["แบบพิมพ์", "โมเดลปูน", "ตัวรีเทนเนอร์", "รีวิว", "สลิป", "อื่น ๆ"];

const NAV = [
  ["dashboard", "✦", "Dashboard"],
  ["customers", "☻", "ลูกค้า"],
  ["orders", "◈", "ออเดอร์"],
  ["lab", "⌬", "Impression Lab"],
  ["finance", "฿", "รายรับ/ต้นทุน"],
  ["media", "▣", "Media Gallery"],
  ["settings", "⚙", "ตั้งค่า"]
];

let state = {
  page: "dashboard",
  loading: false,
  search: "",
  data: loadLocal(),
};

function nowISO(){ return new Date().toISOString(); }
function fmtDate(v){
  if(!v) return "-";
  const d = new Date(v);
  if(Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("th-TH", { dateStyle:"medium", timeStyle:"short" });
}
function fmtShortDate(v){
  if(!v) return "-";
  const d = new Date(v);
  if(Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("th-TH", { day:"2-digit", month:"short" });
}
function money(v){ return new Intl.NumberFormat("th-TH", { style:"currency", currency:"THB", maximumFractionDigits:0 }).format(Number(v || 0)); }
function uid(prefix="ID"){
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
}
function yymm(){
  const d = new Date();
  return String(d.getFullYear()).slice(-2) + String(d.getMonth()+1).padStart(2,"0");
}
function statusMeta(label){ return STATUS.find(s => s.label === label || s.key === label) || STATUS[0]; }
function esc(s){ return String(s ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
function num(v){ return Number(String(v || 0).replace(/,/g,"")) || 0; }
function apiUrl(){ return (localStorage.getItem("cc_api_url") || CONFIG.API_URL || "").trim(); }
function isLive(){ return !!apiUrl(); }

function createEmptyData(){
  return { customers:[], orders:[], costs:[], payments:[], media:[], histories:[], tasks:[] };
}
function seedData(){
  const data = createEmptyData();
  const cid = `HN-${yymm()}-0001`;
  data.customers.push({ customerId:cid, createdAt:nowISO(), fullName:"ตัวอย่าง ลูกค้า", nickname:"Demo", phone:"080-000-0000", lineId:"@demo", address:"กรุงเทพฯ", province:"กรุงเทพฯ", zip:"10200", source:"TikTok", customerStatus:"ลูกค้าใหม่", note:"ข้อมูลตัวอย่าง ลบได้" });
  const oid = `${cid}-01`;
  data.orders.push({ orderId:oid, customerId:cid, createdAt:nowISO(), customerName:"ตัวอย่าง ลูกค้า", phone:"080-000-0000", productName:"Clear Retainer", itemType:"บน+ล่าง", salePrice:2500, discount:0, shippingCharge:0, netRevenue:2500, paymentStatus:"จ่ายครบ", orderStatus:"รอพิมพ์ฟันส่งกลับ", currentStep:"รอลูกค้าส่งแบบพิมพ์กลับ", dueDate:"", priority:"ติดตาม", impressionRound:1, impressionResult:"รอตรวจ", remakeNeeded:"No", notes:"ตัวอย่างออเดอร์", updatedAt:nowISO() });
  data.payments.push({ paymentId:uid("PAY"), orderId:oid, customerId:cid, paymentDate:nowISO(), paymentType:"ชำระเต็ม", channel:"โอน", amount:2500, slipUrl:"", note:"Demo" });
  data.costs.push({ costId:uid("COST"), orderId:oid, customerId:cid, costDate:nowISO(), costType:"ชุดผงพิมพ์/ถาดพิมพ์", description:"ชุดพิมพ์ 1 ชุด", amount:350, paidBy:"ร้าน", note:"Demo" });
  return data;
}
function loadLocal(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw) return { ...createEmptyData(), ...JSON.parse(raw) };
  }catch(e){}
  const seeded = seedData();
  saveLocal(seeded);
  return seeded;
}
function saveLocal(data=state.data){ localStorage.setItem(STORE_KEY, JSON.stringify(data)); }

async function api(action, payload={}){
  if(!isLive()) return localAction(action, payload);
  const url = apiUrl();
  try{
    const res = await fetch(url, {
      method:"POST",
      headers:{ "Content-Type":"text/plain;charset=utf-8" },
      body:JSON.stringify({ action, payload })
    });
    const json = await res.json();
    if(!json.ok) throw new Error(json.message || "API error");
    return json;
  }catch(err){
    console.warn("POST API failed, trying JSONP", err);
    return jsonp(action, payload);
  }
}
function jsonp(action, payload){
  return new Promise((resolve, reject) => {
    const cb = "cc_cb_" + Math.random().toString(36).slice(2);
    const script = document.createElement("script");
    const params = new URLSearchParams({ action, payload: JSON.stringify(payload), callback: cb });
    window[cb] = (data) => { cleanup(); data.ok ? resolve(data) : reject(new Error(data.message || "API error")); };
    const cleanup = () => { delete window[cb]; script.remove(); };
    script.onerror = () => { cleanup(); reject(new Error("เชื่อมต่อ Apps Script ไม่สำเร็จ")); };
    script.src = `${apiUrl()}?${params.toString()}`;
    document.body.appendChild(script);
  });
}

function localAction(action, payload){
  const d = state.data;
  if(action === "ping") return Promise.resolve({ ok:true, data:{ mode:"demo" } });
  if(action === "listAll") return Promise.resolve({ ok:true, data:d });
  if(action === "createCustomer"){
    const customer = { ...payload, customerId: nextCustomerId(), createdAt: nowISO(), customerStatus: payload.customerStatus || "ลูกค้าใหม่" };
    d.customers.unshift(customer); saveLocal(d); return Promise.resolve({ ok:true, data:customer });
  }
  if(action === "createOrder"){
    const c = d.customers.find(x => x.customerId === payload.customerId) || {};
    const order = { orderId: nextOrderId(payload.customerId), customerId:payload.customerId, createdAt: nowISO(), customerName:c.fullName || payload.customerName || "", phone:c.phone || payload.phone || "", productName:"Clear Retainer", itemType:payload.itemType || "บน+ล่าง", salePrice:num(payload.salePrice), discount:num(payload.discount), shippingCharge:num(payload.shippingCharge), netRevenue:num(payload.salePrice)-num(payload.discount)+num(payload.shippingCharge), paymentStatus:payload.paymentStatus || "ยังไม่จ่าย", orderStatus:payload.orderStatus || "ลูกค้ากดสั่ง", currentStep:payload.currentStep || "เปิดออเดอร์ใหม่", dueDate:payload.dueDate || "", priority:payload.priority || "ปกติ", impressionRound:1, impressionResult:"รอตรวจ", remakeNeeded:"No", notes:payload.notes || "", updatedAt:nowISO() };
    d.orders.unshift(order); addHistory(order, "", order.orderStatus, "เปิดออเดอร์"); saveLocal(d); return Promise.resolve({ ok:true, data:order });
  }
  if(action === "updateOrderStatus"){
    const o = d.orders.find(x => x.orderId === payload.orderId); if(!o) throw new Error("ไม่พบออเดอร์");
    const old = o.orderStatus; o.orderStatus = payload.orderStatus; o.currentStep = payload.currentStep || payload.orderStatus; o.updatedAt = nowISO();
    applyStatusDates(o, payload.orderStatus);
    if(payload.orderStatus === "พิมพ์ไม่ผ่าน ต้องส่งชุดใหม่") { o.impressionResult = "ไม่ผ่าน"; o.remakeNeeded = "Yes"; o.impressionRound = num(o.impressionRound) + 1; }
    addHistory(o, old, payload.orderStatus, payload.note || "เปลี่ยนสถานะ"); saveLocal(d); return Promise.resolve({ ok:true, data:o });
  }
  if(action === "addCost"){
    const row = { ...payload, costId:uid("COST"), costDate: payload.costDate || nowISO(), amount:num(payload.amount), paidBy:"ร้าน", createdAt:nowISO() };
    d.costs.unshift(row); saveLocal(d); return Promise.resolve({ ok:true, data:row });
  }
  if(action === "addPayment"){
    const row = { ...payload, paymentId:uid("PAY"), paymentDate: payload.paymentDate || nowISO(), amount:num(payload.amount), createdAt:nowISO() };
    d.payments.unshift(row); saveLocal(d); return Promise.resolve({ ok:true, data:row });
  }
  if(action === "addMedia"){
    const row = { ...payload, mediaId:uid("MEDIA"), fileUrl: payload.fileUrl || payload.dataUrl || "", createdAt:nowISO() };
    d.media.unshift(row); saveLocal(d); return Promise.resolve({ ok:true, data:row });
  }
  if(action === "resetDemo"){
    state.data = seedData(); saveLocal(state.data); return Promise.resolve({ ok:true, data:state.data });
  }
  return Promise.resolve({ ok:true, data:null });
}
function nextCustomerId(){
  const prefix = `${CONFIG.HN_PREFIX || "HN"}-${yymm()}-`;
  const count = state.data.customers.filter(c => String(c.customerId || "").startsWith(prefix)).length + 1;
  return prefix + String(count).padStart(4,"0");
}
function nextOrderId(customerId){
  const count = state.data.orders.filter(o => o.customerId === customerId).length + 1;
  return `${customerId}-${String(count).padStart(2,"0")}`;
}
function addHistory(order, oldStatus, newStatus, note){
  state.data.histories.unshift({ historyId:uid("HIS"), orderId:order.orderId, customerId:order.customerId, oldStatus, newStatus, changedAt:nowISO(), note });
}
function applyStatusDates(o, status){
  const t = nowISO();
  if(status === "ส่งชุดพิมพ์ให้ลูกค้า") o.impressionSentDate = t;
  if(status === "ได้รับแบบพิมพ์แล้ว") o.impressionReceivedDate = t;
  if(status === "เทปูนขึ้นรูป") o.plasterDate = t;
  if(status === "ขึ้นรูปรีเทนเนอร์") o.retainerFormedDate = t;
  if(status === "ส่งคืนลูกค้าแล้ว") o.finalSentDate = t;
  if(status === "ปิดงาน") o.closedDate = t;
}

async function loadAll(){
  state.loading = true; renderShell();
  try{
    const res = await api("listAll");
    state.data = normalizeData(res.data || createEmptyData());
    if(!isLive()) saveLocal(state.data);
    toast(isLive() ? "โหลดข้อมูลจาก Google Sheet แล้ว" : "Demo Local Mode: ข้อมูลเก็บในเครื่องนี้");
  }catch(err){
    toast("โหลด API ไม่สำเร็จ ใช้ข้อมูล Demo ในเครื่องแทน: " + err.message, true);
    state.data = loadLocal();
  }finally{
    state.loading = false; renderShell();
  }
}
function normalizeData(d){
  return {
    customers: d.customers || d.Customers || [],
    orders: d.orders || d.Orders || [],
    costs: d.costs || d.Costs || [],
    payments: d.payments || d.Payments || [],
    media: d.media || d.Media || [],
    histories: d.histories || d.StatusHistory || [],
    tasks: d.tasks || d.Tasks || []
  };
}

function filtered(arr, fields){
  const q = state.search.trim().toLowerCase();
  if(!q) return arr;
  return arr.filter(item => fields.some(f => String(item[f] || "").toLowerCase().includes(q)));
}
function activeOrders(){ return state.data.orders.filter(o => !["ปิดงาน","ยกเลิก","CLOSED","CANCELLED"].includes(o.orderStatus)); }
function dashboardStats(){
  const orders = state.data.orders;
  const active = activeOrders();
  const revenue = state.data.payments.length ? state.data.payments.reduce((s,p)=>s+num(p.amount),0) : orders.reduce((s,o)=>s+num(o.netRevenue),0);
  const costs = state.data.costs.reduce((s,c)=>s+num(c.amount),0);
  return {
    totalCustomers: state.data.customers.length,
    totalOrders: orders.length,
    active: active.length,
    waiting: active.filter(o => o.orderStatus === "รอพิมพ์ฟันส่งกลับ").length,
    failed: active.filter(o => o.orderStatus === "พิมพ์ไม่ผ่าน ต้องส่งชุดใหม่").length,
    working: active.filter(o => ["ได้รับแบบพิมพ์แล้ว","เทปูนขึ้นรูป","ขึ้นรูปรีเทนเนอร์","ตรวจงาน QC"].includes(o.orderStatus)).length,
    ready: active.filter(o => ["พร้อมส่งคืนลูกค้า","ส่งคืนลูกค้าแล้ว"].includes(o.orderStatus)).length,
    revenue, costs, profit: revenue - costs
  };
}

function renderShell(){
  document.getElementById("nav").innerHTML = NAV.map(([key, icon, label]) => `<button class="${state.page===key?'active':''}" data-nav="${key}"><span>${icon}</span><span>${label}</span></button>`).join("");
  document.getElementById("pageTitle").textContent = NAV.find(n=>n[0]===state.page)?.[2] || "Dashboard";
  document.getElementById("globalSearch").value = state.search;
  const stats = dashboardStats();
  const focus = stats.failed ? `มีพิมพ์ไม่ผ่าน ${stats.failed} เคส ต้องรีบส่งชุดใหม่` : stats.waiting ? `มี ${stats.waiting} เคสที่รอลูกค้าส่งพิมพ์ฟันกลับ` : stats.ready ? `มี ${stats.ready} เคสพร้อมส่ง/รอปิดงาน` : "วันนี้สถานะงานดูดี ไม่มีเคสวิกฤต";
  document.getElementById("focusText").textContent = focus;
  renderPage();
}
function renderPage(){
  const el = document.getElementById("content");
  if(state.loading){ el.innerHTML = `<div class="empty"><strong>กำลังโหลดข้อมูล...</strong><p>กำลังเชื่อมต่อฐานข้อมูล</p></div>`; return; }
  const pages = { dashboard:renderDashboard, customers:renderCustomers, orders:renderOrders, lab:renderLab, finance:renderFinance, media:renderMedia, settings:renderSettings };
  el.innerHTML = (pages[state.page] || renderDashboard)();
}

function renderDashboard(){
  const s = dashboardStats();
  const statusCounts = STATUS_LABELS.map(label => ({ label, count: state.data.orders.filter(o => o.orderStatus === label).length })).filter(x=>x.count>0);
  const max = Math.max(1, ...statusCounts.map(x=>x.count));
  const recent = [...state.data.orders].slice(0,8);
  return `
    <section class="hero">
      <h3>Crystal Clear Operations Hub</h3>
      <p>หลังบ้านสำหรับ Clear Retainer ตั้งแต่ลูกค้ากดสั่ง ส่งชุดพิมพ์ รอพิมพ์ฟัน เทปูน ขึ้นรูปรีเทนเนอร์ เก็บต้นทุน รายได้ และรูปสำหรับรีวิวในอนาคต</p>
      <div class="pill-list" style="margin-top:16px">
        <span class="api-pill ${isLive()?'live':''}">${isLive()?"LIVE Google Sheet":"DEMO Local Mode"}</span>
        <span class="badge gold">HN Auto Code</span>
        <span class="badge blue">Premium UI</span>
        <span class="badge green">Mobile Ready</span>
      </div>
    </section>
    <section class="grid metrics">
      ${metric("ค้างส่ง/งาน active", s.active, "เคสที่ยังไม่ปิดงาน")}
      ${metric("รอพิมพ์ฟัน", s.waiting, "ต้องตามลูกค้า", "orange")}
      ${metric("พิมพ์ไม่ผ่าน", s.failed, "ต้องส่งชุดใหม่", "red")}
      ${metric("ระหว่างทำ", s.working, "เทปูน/ขึ้นรูป/QC", "purple")}
    </section>
    <section class="grid metrics">
      ${metric("รายรับ", money(s.revenue), "จากยอดชำระ/ยอดขาย", "green")}
      ${metric("ต้นทุน", money(s.costs), "รวมต่อเคสที่บันทึก", "gold")}
      ${metric("กำไรประมาณ", money(s.profit), "รายรับ - ต้นทุน", s.profit>=0?"green":"red")}
      ${metric("ลูกค้าทั้งหมด", s.totalCustomers, "HN ในระบบ", "blue")}
    </section>
    <section class="grid two">
      <div class="card">
        <h3>สถานะงานทั้งหมด <button class="btn small secondary" data-nav="orders">ดูออเดอร์</button></h3>
        <div class="bars">
          ${statusCounts.length ? statusCounts.map(x=>`<div class="bar-row"><span>${esc(x.label)}</span><div class="bar"><span style="width:${Math.max(8, x.count/max*100)}%"></span></div><strong>${x.count}</strong></div>`).join("") : `<div class="empty"><strong>ยังไม่มีออเดอร์</strong></div>`}
        </div>
      </div>
      <div class="card">
        <h3>Quick Actions</h3>
        <div class="grid" style="gap:10px">
          <button class="btn primary" data-action="openCustomerModal">+ เพิ่มลูกค้า / สร้าง HN</button>
          <button class="btn gold" data-action="openOrderModal">+ เปิดออเดอร์ Clear Retainer</button>
          <button class="btn secondary" data-action="openCostModal">+ บันทึกต้นทุนต่อเคส</button>
          <button class="btn secondary" data-action="openMediaModal">+ เพิ่มรูปพิมพ์ปูน / รีเทนเนอร์</button>
        </div>
      </div>
    </section>
    <section class="card">
      <h3>ออเดอร์ล่าสุด</h3>
      ${ordersTable(recent)}
    </section>
  `;
}
function metric(label, value, sub, tone="blue"){
  return `<div class="metric"><div class="label">${label}</div><div class="value ${tone==='red'?'negative':''}">${value}</div><div class="sub">${sub}</div></div>`;
}

function renderCustomers(){
  const customers = filtered(state.data.customers, ["customerId","fullName","nickname","phone","lineId","province","source"]);
  return `
    <section class="hero"><h3>Customer HN Registry</h3><p>จัดการลูกค้าแยกแต่ละคนด้วย HN เก็บเบอร์ ที่อยู่ ประวัติ และใช้ผูกกับออเดอร์ทั้งหมด</p></section>
    <div class="card"><h3>ลูกค้าทั้งหมด <button class="btn small primary" data-action="openCustomerModal">+ เพิ่มลูกค้า</button></h3>${customersTable(customers)}</div>`;
}
function customersTable(rows){
  if(!rows.length) return `<div class="empty"><strong>ยังไม่มีลูกค้า</strong><p>กดเพิ่มลูกค้าเพื่อเริ่มสร้าง HN</p></div>`;
  return `<div class="table-wrap"><table><thead><tr><th>HN</th><th>ลูกค้า</th><th>เบอร์/LINE</th><th>ที่อยู่</th><th>ช่องทาง</th><th>ออเดอร์</th><th>Action</th></tr></thead><tbody>${rows.map(c=>{
    const cnt = state.data.orders.filter(o=>o.customerId===c.customerId).length;
    return `<tr><td><strong>${esc(c.customerId)}</strong></td><td>${esc(c.fullName)}<br><span class="muted">${esc(c.nickname||"")}</span></td><td>${esc(c.phone)}<br>${esc(c.lineId||"")}</td><td>${esc(c.address||"-")}<br>${esc(c.province||"")} ${esc(c.zip||"")}</td><td><span class="badge blue">${esc(c.source||"-")}</span></td><td>${cnt}</td><td><button class="btn small secondary" data-action="openOrderModal" data-customer="${esc(c.customerId)}">เปิดออเดอร์</button></td></tr>`;
  }).join("")}</tbody></table></div>`;
}

function renderOrders(){
  const orders = filtered(state.data.orders, ["orderId","customerId","customerName","phone","orderStatus","itemType","priority"]);
  return `
    <section class="hero"><h3>Order Pipeline</h3><p>ติดตามงานทุกเคสจากการสั่งซื้อจนปิดงาน พร้อมสถานะงานสำคัญสำหรับร้านรีเทนเนอร์</p></section>
    <section class="card"><h3>Kanban งานสำคัญ <button class="btn small primary" data-action="openOrderModal">+ เปิดออเดอร์</button></h3>${kanban(orders)}</section>
    <section class="card"><h3>ตารางออเดอร์ทั้งหมด</h3>${ordersTable(orders, true)}</section>`;
}
function kanban(orders){
  const groups = [
    ["รอ/ค้าง", ["ลูกค้ากดสั่ง","ส่งชุดพิมพ์ให้ลูกค้า","รอพิมพ์ฟันส่งกลับ"]],
    ["ปัญหา", ["พิมพ์ไม่ผ่าน ต้องส่งชุดใหม่"]],
    ["ระหว่างทำ", ["ได้รับแบบพิมพ์แล้ว","เทปูนขึ้นรูป","ขึ้นรูปรีเทนเนอร์","ตรวจงาน QC"]],
    ["พร้อมส่ง/ปิด", ["พร้อมส่งคืนลูกค้า","ส่งคืนลูกค้าแล้ว","ปิดงาน"]]
  ];
  return `<div class="kanban">${groups.map(([title, labels])=>{
    const list = orders.filter(o=>labels.includes(o.orderStatus));
    return `<div class="kanban-column"><div class="kanban-title"><span>${title}</span><span class="badge gray">${list.length}</span></div>${list.length?list.map(orderCard).join(""):`<div class="empty"><strong>ไม่มีงาน</strong></div>`}</div>`;
  }).join("")}</div>`;
}
function orderCard(o){
  const sm = statusMeta(o.orderStatus);
  return `<article class="order-card">
    <h4>${esc(o.customerName || "ไม่ระบุชื่อ")}</h4>
    <div class="meta"><span>${esc(o.customerId)}</span><span>${esc(o.itemType||"Clear Retainer")}</span><span>${money(o.netRevenue || o.salePrice)}</span></div>
    <span class="badge ${sm.tone}">${esc(o.orderStatus)}</span>
    <div style="margin:12px 0 8px" class="progress-line"><span style="width:${sm.progress}%"></span></div>
    <select data-action="changeStatus" data-order="${esc(o.orderId)}">${STATUS_LABELS.map(label=>`<option ${label===o.orderStatus?'selected':''}>${label}</option>`).join("")}</select>
    <div class="actions"><button class="btn small secondary" data-action="openOrderDetail" data-order="${esc(o.orderId)}">รายละเอียด</button><button class="btn small secondary" data-action="openCostModal" data-order="${esc(o.orderId)}">ต้นทุน</button><button class="btn small secondary" data-action="openMediaModal" data-order="${esc(o.orderId)}">รูป</button></div>
  </article>`;
}
function ordersTable(rows, includeActions=false){
  if(!rows.length) return `<div class="empty"><strong>ยังไม่มีออเดอร์</strong><p>กดเปิดออเดอร์เพื่อเริ่มงาน</p></div>`;
  return `<div class="table-wrap"><table><thead><tr><th>Order</th><th>HN</th><th>ลูกค้า</th><th>สินค้า</th><th>ราคา</th><th>สถานะ</th><th>อัปเดต</th>${includeActions?"<th>Action</th>":""}</tr></thead><tbody>${rows.map(o=>{
    const sm=statusMeta(o.orderStatus);
    return `<tr><td><strong>${esc(o.orderId)}</strong></td><td>${esc(o.customerId)}</td><td>${esc(o.customerName)}<br><span class="muted">${esc(o.phone||"")}</span></td><td>${esc(o.productName||"Clear Retainer")}<br>${esc(o.itemType||"")}</td><td class="fin-number">${money(o.netRevenue || o.salePrice)}</td><td><span class="badge ${sm.tone}">${esc(o.orderStatus)}</span></td><td>${fmtDate(o.updatedAt || o.createdAt)}</td>${includeActions?`<td><button class="btn small secondary" data-action="openOrderDetail" data-order="${esc(o.orderId)}">ดู</button></td>`:""}</tr>`;
  }).join("")}</tbody></table></div>`;
}

function renderLab(){
  const labOrders = filtered(state.data.orders.filter(o => !["ปิดงาน","ยกเลิก"].includes(o.orderStatus)), ["orderId","customerId","customerName","orderStatus","impressionResult"]);
  const failed = labOrders.filter(o=>o.orderStatus==="พิมพ์ไม่ผ่าน ต้องส่งชุดใหม่");
  return `<section class="hero"><h3>Impression & Production Lab</h3><p>หน้าสำหรับโฟกัสงานพิมพ์ฟัน เทปูน ขึ้นรูป และเคสที่พิมพ์ไม่ผ่านต้องส่งชุดใหม่</p></section>
  <section class="grid metrics">${metric("รอพิมพ์ฟัน", labOrders.filter(o=>o.orderStatus==="รอพิมพ์ฟันส่งกลับ").length,"ต้องตามลูกค้า","orange")}${metric("พิมพ์ไม่ผ่าน", failed.length,"ส่งชุดใหม่","red")}${metric("เทปูน", labOrders.filter(o=>o.orderStatus==="เทปูนขึ้นรูป").length,"โมเดลปูน","purple")}${metric("ขึ้นรูป", labOrders.filter(o=>o.orderStatus==="ขึ้นรูปรีเทนเนอร์").length,"ตัวรีเทนเนอร์","purple")}</section>
  <section class="card"><h3>Lab Pipeline</h3>${ordersTable(labOrders, true)}</section>`;
}

function renderFinance(){
  const s = dashboardStats();
  const costByType = COST_TYPES.map(t => ({ label:t, amount: state.data.costs.filter(c=>c.costType===t).reduce((a,c)=>a+num(c.amount),0)})).filter(x=>x.amount>0);
  const max = Math.max(1, ...costByType.map(x=>x.amount));
  return `<section class="hero"><h3>Revenue & Cost Control</h3><p>เก็บรายได้และต้นทุนจริงต่อเคส เพื่อดูว่ากำไรจริงต่อออเดอร์เป็นเท่าไร ไม่หลุดค่าส่ง/ค่าชุดพิมพ์/ค่าพิมพ์ใหม่</p></section>
  <section class="grid metrics">${metric("รายรับรวม", money(s.revenue),"ยอดชำระทั้งหมด","green")}${metric("ต้นทุนรวม", money(s.costs),"ต้นทุนทุกประเภท","gold")}${metric("กำไร", money(s.profit),"รายรับ - ต้นทุน",s.profit>=0?"green":"red")}${metric("เฉลี่ยต่อออเดอร์", money(s.totalOrders? s.profit/s.totalOrders : 0),"กำไรเฉลี่ย",s.profit>=0?"green":"red")}</section>
  <section class="grid two"><div class="card"><h3>ต้นทุนแยกประเภท <button class="btn small secondary" data-action="openCostModal">+ เพิ่มต้นทุน</button></h3><div class="bars">${costByType.length?costByType.map(x=>`<div class="bar-row"><span>${esc(x.label)}</span><div class="bar"><span style="width:${Math.max(8,x.amount/max*100)}%"></span></div><strong>${money(x.amount)}</strong></div>`).join(""):`<div class="empty"><strong>ยังไม่มีต้นทุน</strong></div>`}</div></div><div class="card"><h3>บันทึกรายรับ <button class="btn small primary" data-action="openPaymentModal">+ เพิ่มรายรับ</button></h3>${paymentsTable()}</div></section>
  <section class="card"><h3>รายการต้นทุนล่าสุด</h3>${costsTable()}</section>`;
}
function costsTable(){
  const rows = state.data.costs.slice(0,20);
  if(!rows.length) return `<div class="empty"><strong>ยังไม่มีต้นทุน</strong></div>`;
  return `<div class="table-wrap"><table><thead><tr><th>วันที่</th><th>Order</th><th>ประเภท</th><th>รายละเอียด</th><th>จำนวน</th></tr></thead><tbody>${rows.map(c=>`<tr><td>${fmtShortDate(c.costDate||c.createdAt)}</td><td>${esc(c.orderId)}</td><td>${esc(c.costType)}</td><td>${esc(c.description||c.note||"")}</td><td class="fin-number negative">${money(c.amount)}</td></tr>`).join("")}</tbody></table></div>`;
}
function paymentsTable(){
  const rows = state.data.payments.slice(0,8);
  if(!rows.length) return `<div class="empty"><strong>ยังไม่มีรายรับ</strong></div>`;
  return `<div>${rows.map(p=>`<div class="stat-row"><span>${esc(p.orderId)}<br>${fmtShortDate(p.paymentDate||p.createdAt)}</span><strong class="positive">${money(p.amount)}</strong></div>`).join("")}</div>`;
}

function renderMedia(){
  const rows = filtered(state.data.media, ["orderId","customerId","mediaType","title","note"]);
  return `<section class="hero"><h3>Media Gallery for Reviews</h3><p>เก็บรูปแบบพิมพ์ โมเดลปูน ตัวรีเทนเนอร์ และรูปที่ขออนุญาตใช้รีวิวในอนาคต แยกตาม HN/Order</p></section>
  <section class="card"><h3>คลังรูป <button class="btn small primary" data-action="openMediaModal">+ เพิ่มรูป</button></h3>${mediaGrid(rows)}</section>`;
}
function mediaGrid(rows){
  if(!rows.length) return `<div class="empty"><strong>ยังไม่มีรูป</strong><p>เพิ่มรูปพิมพ์ปูน / ตัวรีเทนเนอร์ / รีวิว เพื่อสร้างคลังผลงาน</p></div>`;
  return `<div class="media-grid">${rows.map(m=>`<article class="media-card"><div class="media-thumb">${m.fileUrl?`<img src="${esc(m.fileUrl)}" alt="${esc(m.title||m.mediaType)}" onerror="this.outerHTML='<span>รูป / ลิงก์ไฟล์</span>'">`:`<span>ไม่มีรูป</span>`}</div><div class="body"><h4>${esc(m.title||m.mediaType)}</h4><p>${esc(m.mediaType)} · ${esc(m.orderId||"")}<br>${esc(m.consentForReview==="Yes"?"อนุญาตใช้รีวิว":"เก็บภายใน")}</p></div></article>`).join("")}</div>`;
}

function renderSettings(){
  return `<section class="hero"><h3>Settings & Deployment</h3><p>ตั้งค่าเชื่อมต่อ Google Apps Script API สำหรับใช้ Google Sheet เป็นฐานข้อมูลจริง หรือใช้ Demo Local Mode เพื่อทดลองบน GitHub Pages ทันที</p></section>
  <section class="grid two"><div class="card"><h3>API Connection</h3><div class="field"><label>Google Apps Script Web App URL</label><input class="form-control" id="apiUrlInput" value="${esc(apiUrl())}" placeholder="https://script.google.com/macros/s/.../exec"><div class="hint">เว้นว่าง = Demo Local Mode / ใส่ URL = ใช้ Google Sheet จริง</div></div><div class="modal-actions"><button class="btn secondary" data-action="testApi">ทดสอบ API</button><button class="btn primary" data-action="saveApiUrl">บันทึก URL</button></div></div><div class="card"><h3>Demo Data</h3><p class="muted">ใช้สำหรับทดสอบเว็บก่อนต่อ Google Sheet จริง ข้อมูลจะเก็บใน browser เครื่องนี้</p><div class="modal-actions"><button class="btn danger" data-action="resetDemo">รีเซ็ตข้อมูล Demo</button><button class="btn secondary" data-action="exportJson">Export JSON</button></div></div></section>
  <section class="card"><h3>สถานะระบบ</h3><div class="stat-row"><span>Mode</span><strong>${isLive()?"LIVE Google Sheet":"DEMO Local"}</strong></div><div class="stat-row"><span>Database</span><strong>Google Sheet / LocalStorage</strong></div><div class="stat-row"><span>Media Upload</span><strong>Drive via Apps Script หรือ Local Preview</strong></div><div class="stat-row"><span>LINE Alert</span><strong>ตั้งค่าในชีท Settings</strong></div></section>`;
}

function openModal(title, subtitle, body, footer){
  const root = document.getElementById("modalRoot");
  root.classList.remove("hidden");
  root.innerHTML = `<div class="modal-panel"><div class="modal-head"><div><h3>${title}</h3><p>${subtitle||""}</p></div><button class="x" data-action="closeModal">×</button></div>${body}<div class="modal-actions">${footer||""}</div></div>`;
}
function closeModal(){ document.getElementById("modalRoot").classList.add("hidden"); document.getElementById("modalRoot").innerHTML=""; }
function getForm(root=document){
  const obj = {};
  root.querySelectorAll("[name]").forEach(el => obj[el.name] = el.type === "checkbox" ? (el.checked ? "Yes" : "No") : el.value);
  return obj;
}
function customerOptions(selected=""){
  return state.data.customers.map(c=>`<option value="${esc(c.customerId)}" ${c.customerId===selected?'selected':''}>${esc(c.customerId)} — ${esc(c.fullName)}</option>`).join("");
}
function orderOptions(selected=""){
  return state.data.orders.map(o=>`<option value="${esc(o.orderId)}" ${o.orderId===selected?'selected':''}>${esc(o.orderId)} — ${esc(o.customerName)} — ${esc(o.orderStatus)}</option>`).join("");
}
function selectedOrderCustomer(orderId){ return state.data.orders.find(o=>o.orderId===orderId)?.customerId || ""; }

function openCustomerModal(){
  openModal("เพิ่มลูกค้าใหม่", "ระบบจะสร้าง HN อัตโนมัติ เช่น HN-YYMM-0001", `<div class="form-grid">
    ${field("fullName","ชื่อ-นามสกุล","text",true)}${field("nickname","ชื่อเล่น")}${field("phone","เบอร์โทร","tel",true)}${field("lineId","LINE ID")}${field("address","ที่อยู่จัดส่ง","textarea",false,"full")}${field("province","จังหวัด")}${field("zip","รหัสไปรษณีย์")}${selectField("source","ช่องทางที่มา",["Facebook","TikTok","LINE","Shopee","แนะนำต่อ","อื่น ๆ"])}${field("note","หมายเหตุ","textarea",false,"full")}</div>`, `<button class="btn secondary" data-action="closeModal">ยกเลิก</button><button class="btn primary" data-action="saveCustomer">บันทึกลูกค้า</button>`);
}
function openOrderModal(customerId=""){
  if(!state.data.customers.length){ toast("ต้องเพิ่มลูกค้าก่อนเปิดออเดอร์", true); openCustomerModal(); return; }
  openModal("เปิดออเดอร์ Clear Retainer", "ราคาขายและต้นทุนกรอกเองได้ทุกเคส", `<div class="form-grid">
    <div class="field full"><label>ลูกค้า / HN</label><select name="customerId" class="form-control">${customerOptions(customerId)}</select></div>
    ${selectField("itemType","ประเภทสินค้า",["ชิ้นบน","ชิ้นล่าง","บน+ล่าง","ทำใหม่/เคลม","อื่น ๆ"])}${selectField("priority","ความสำคัญ",["ปกติ","ด่วน","ติดตาม"])}
    ${field("salePrice","ราคาขาย","number",true)}${field("discount","ส่วนลด","number")}${field("shippingCharge","ค่าส่งที่เก็บลูกค้า","number")}${selectField("paymentStatus","สถานะชำระเงิน",["ยังไม่จ่าย","มัดจำแล้ว","จ่ายครบ","คืนเงิน","ยกเลิก"])}
    ${selectField("orderStatus","สถานะเริ่มต้น",STATUS_LABELS)}${field("dueDate","วันนัด/กำหนดส่ง","datetime-local")}${field("notes","หมายเหตุ","textarea",false,"full")}</div>`, `<button class="btn secondary" data-action="closeModal">ยกเลิก</button><button class="btn primary" data-action="saveOrder">สร้างออเดอร์</button>`);
}
function openCostModal(orderId=""){
  if(!state.data.orders.length){ toast("ต้องมีออเดอร์ก่อนบันทึกต้นทุน", true); return; }
  openModal("บันทึกต้นทุนต่อเคส", "ค่าส่งไป-กลับ ชุดพิมพ์ ผงพิมพ์ ปูน วัสดุ กล่อง ทำใหม่ ฯลฯ", `<div class="form-grid">
    <div class="field full"><label>ออเดอร์</label><select name="orderId" class="form-control">${orderOptions(orderId)}</select></div>${selectField("costType","ประเภทต้นทุน",COST_TYPES)}${field("amount","จำนวนเงิน","number",true)}${field("description","รายละเอียด")}${field("note","หมายเหตุ","textarea",false,"full")}</div>`, `<button class="btn secondary" data-action="closeModal">ยกเลิก</button><button class="btn primary" data-action="saveCost">บันทึกต้นทุน</button>`);
}
function openPaymentModal(){
  if(!state.data.orders.length){ toast("ต้องมีออเดอร์ก่อนบันทึกรายรับ", true); return; }
  openModal("บันทึกรายรับ", "เก็บยอดชำระจริงต่อเคส", `<div class="form-grid"><div class="field full"><label>ออเดอร์</label><select name="orderId" class="form-control">${orderOptions()}</select></div>${selectField("paymentType","ประเภท",["มัดจำ","ชำระเต็ม","ชำระส่วนที่เหลือ","คืนเงิน"])}${selectField("channel","ช่องทาง",["โอน","เงินสด","QR","Shopee","TikTok","อื่น ๆ"])}${field("amount","จำนวนเงิน","number",true)}${field("slipUrl","ลิงก์สลิป")}${field("note","หมายเหตุ","textarea",false,"full")}</div>`, `<button class="btn secondary" data-action="closeModal">ยกเลิก</button><button class="btn primary" data-action="savePayment">บันทึกรายรับ</button>`);
}
function openMediaModal(orderId=""){
  if(!state.data.orders.length){ toast("ต้องมีออเดอร์ก่อนเพิ่มรูป", true); return; }
  openModal("เพิ่มรูป / ไฟล์ Media", "เก็บรูปโมเดลปูน ตัวรีเทนเนอร์ สลิป หรือรูปรีวิวในอนาคต", `<div class="form-grid"><div class="field full"><label>ออเดอร์</label><select name="orderId" class="form-control">${orderOptions(orderId)}</select></div>${selectField("mediaType","ประเภทรูป",MEDIA_TYPES)}${field("title","ชื่อรูป/หัวข้อ")}${field("fileUrl","ลิงก์รูป Google Drive / URL")}
  <div class="field full"><label>อัปโหลดรูปจากเครื่อง</label><div class="dropzone">เลือกรูปเพื่อเก็บเข้า Drive ผ่าน Apps Script หรือเก็บใน Demo Preview<input name="file" type="file" accept="image/*" class="form-control"></div></div>
  <div class="field full"><label><input name="consentForReview" type="checkbox"> ลูกค้าอนุญาตให้นำรูปไปใช้รีวิว/คอนเทนต์</label></div>${field("note","หมายเหตุ","textarea",false,"full")}</div>`, `<button class="btn secondary" data-action="closeModal">ยกเลิก</button><button class="btn primary" data-action="saveMedia">บันทึกรูป</button>`);
}
function openOrderDetail(orderId){
  const o = state.data.orders.find(x=>x.orderId===orderId); if(!o) return;
  const c = state.data.customers.find(x=>x.customerId===o.customerId) || {};
  const costs = state.data.costs.filter(x=>x.orderId===orderId).reduce((s,x)=>s+num(x.amount),0);
  const pays = state.data.payments.filter(x=>x.orderId===orderId).reduce((s,x)=>s+num(x.amount),0);
  const hist = state.data.histories.filter(h=>h.orderId===orderId);
  const media = state.data.media.filter(m=>m.orderId===orderId);
  openModal(`รายละเอียด ${esc(orderId)}`, `${esc(c.fullName||o.customerName)} · ${esc(o.customerId)}`, `<div class="grid two"><div class="card"><h3>ข้อมูลออเดอร์</h3><div class="stat-row"><span>สถานะ</span><strong>${esc(o.orderStatus)}</strong></div><div class="stat-row"><span>สินค้า</span><strong>${esc(o.itemType)}</strong></div><div class="stat-row"><span>ยอดขาย</span><strong>${money(o.netRevenue || o.salePrice)}</strong></div><div class="stat-row"><span>รายรับที่บันทึก</span><strong class="positive">${money(pays)}</strong></div><div class="stat-row"><span>ต้นทุนที่บันทึก</span><strong class="negative">${money(costs)}</strong></div><div class="stat-row"><span>กำไรประมาณ</span><strong class="${pays-costs>=0?'positive':'negative'}">${money((pays || num(o.netRevenue))-costs)}</strong></div></div><div class="card"><h3>ข้อมูลลูกค้า</h3><p class="muted">${esc(c.phone||o.phone||"")}<br>${esc(c.lineId||"")}<br>${esc(c.address||"")} ${esc(c.province||"")} ${esc(c.zip||"")}</p></div></div><div class="timeline" style="margin-top:14px"><h3>Timeline</h3>${hist.length?hist.map(h=>`<div class="timeline-item"><span class="dot"></span><div><strong>${esc(h.newStatus)}</strong><p>${fmtDate(h.changedAt)} · ${esc(h.note||"")}</p></div></div>`).join(""):`<div class="empty"><strong>ยังไม่มีประวัติ</strong></div>`}</div><div style="margin-top:14px">${mediaGrid(media)}</div>`, `<button class="btn secondary" data-action="closeModal">ปิด</button><button class="btn secondary" data-action="openCostModal" data-order="${esc(orderId)}">+ ต้นทุน</button><button class="btn primary" data-action="openMediaModal" data-order="${esc(orderId)}">+ รูป</button>`);
}
function field(name,label,type="text",required=false,extra=""){
  if(type==="textarea") return `<div class="field ${extra}"><label>${label}</label><textarea class="form-control" name="${name}" ${required?'required':''}></textarea></div>`;
  return `<div class="field ${extra}"><label>${label}</label><input class="form-control" name="${name}" type="${type}" ${required?'required':''}></div>`;
}
function selectField(name,label,options){ return `<div class="field"><label>${label}</label><select class="form-control" name="${name}">${options.map(x=>`<option>${esc(x)}</option>`).join("")}</select></div>`; }

async function saveCustomer(){
  const f = getForm(document.getElementById("modalRoot"));
  if(!f.fullName || !f.phone) return toast("กรอกชื่อและเบอร์ก่อน", true);
  await api("createCustomer", f); closeModal(); await loadAll(); toast("เพิ่มลูกค้าและสร้าง HN แล้ว");
}
async function saveOrder(){
  const f = getForm(document.getElementById("modalRoot"));
  if(!f.customerId || !f.salePrice) return toast("เลือกลูกค้าและกรอกราคาขายก่อน", true);
  await api("createOrder", f); closeModal(); await loadAll(); toast("เปิดออเดอร์แล้ว");
}
async function changeStatus(orderId, orderStatus){
  await api("updateOrderStatus", { orderId, orderStatus, currentStep: orderStatus }); await loadAll(); toast("อัปเดตสถานะแล้ว");
}
async function saveCost(){
  const f = getForm(document.getElementById("modalRoot"));
  const order = state.data.orders.find(o=>o.orderId===f.orderId); f.customerId = order?.customerId || "";
  if(!f.orderId || !f.amount) return toast("เลือกออเดอร์และกรอกจำนวนเงินก่อน", true);
  await api("addCost", f); closeModal(); await loadAll(); toast("บันทึกต้นทุนแล้ว");
}
async function savePayment(){
  const f = getForm(document.getElementById("modalRoot"));
  const order = state.data.orders.find(o=>o.orderId===f.orderId); f.customerId = order?.customerId || "";
  if(!f.orderId || !f.amount) return toast("เลือกออเดอร์และกรอกจำนวนเงินก่อน", true);
  await api("addPayment", f); closeModal(); await loadAll(); toast("บันทึกรายรับแล้ว");
}
async function saveMedia(){
  const root = document.getElementById("modalRoot");
  const f = getForm(root);
  const order = state.data.orders.find(o=>o.orderId===f.orderId); f.customerId = order?.customerId || "";
  const file = root.querySelector("input[type=file]")?.files?.[0];
  if(file){
    const dataUrl = await fileToDataUrl(file);
    f.dataUrl = dataUrl;
    f.fileName = file.name;
    if(!f.title) f.title = file.name;
  }
  if(!f.orderId) return toast("เลือกออเดอร์ก่อน", true);
  await api("addMedia", f); closeModal(); await loadAll(); toast("บันทึกรูปแล้ว");
}
function fileToDataUrl(file){ return new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); }); }

function toast(msg, danger=false){
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.style.background = danger ? "rgba(164,35,62,.95)" : "rgba(4,40,56,.94)";
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>el.classList.remove("show"), 2800);
}

function exportJson(){
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type:"application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `crystal-clear-export-${Date.now()}.json`; a.click(); URL.revokeObjectURL(a.href);
}

document.addEventListener("click", async (e)=>{
  const btn = e.target.closest("[data-action],[data-nav]"); if(!btn) return;
  const nav = btn.dataset.nav;
  if(nav){ state.page = nav; renderShell(); return; }
  const action = btn.dataset.action;
  try{
    if(action === "refresh") return loadAll();
    if(action === "closeModal") return closeModal();
    if(action === "openCustomerModal") return openCustomerModal();
    if(action === "openOrderModal") return openOrderModal(btn.dataset.customer || "");
    if(action === "openCostModal") return openCostModal(btn.dataset.order || "");
    if(action === "openPaymentModal") return openPaymentModal();
    if(action === "openMediaModal") return openMediaModal(btn.dataset.order || "");
    if(action === "openOrderDetail") return openOrderDetail(btn.dataset.order);
    if(action === "saveCustomer") return saveCustomer();
    if(action === "saveOrder") return saveOrder();
    if(action === "saveCost") return saveCost();
    if(action === "savePayment") return savePayment();
    if(action === "saveMedia") return saveMedia();
    if(action === "saveApiUrl") { localStorage.setItem("cc_api_url", document.getElementById("apiUrlInput").value.trim()); toast("บันทึก API URL แล้ว"); return loadAll(); }
    if(action === "testApi") { const res = await api("ping"); toast("API พร้อมใช้งาน: " + JSON.stringify(res.data || {})); return; }
    if(action === "resetDemo") { await api("resetDemo"); await loadAll(); toast("รีเซ็ต Demo แล้ว"); return; }
    if(action === "exportJson") return exportJson();
  }catch(err){ toast(err.message || String(err), true); }
});
document.addEventListener("change", async (e)=>{
  const el = e.target.closest("[data-action='changeStatus']"); if(!el) return;
  try{ await changeStatus(el.dataset.order, el.value); }catch(err){ toast(err.message, true); }
});
document.getElementById("globalSearch").addEventListener("input", (e)=>{ state.search = e.target.value; renderPage(); });

document.addEventListener("keydown", (e)=>{ if(e.key === "Escape") closeModal(); });

loadAll();
