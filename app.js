const API_URL = "https://script.google.com/macros/s/AKfycbx8o0Fb7XvANoagptA795gdYhvbnsVC4sYNoxsSEP6HpaHFPEKgh1_GMe5AYgyrBZNgsA/exec";

const STATUS = [
  "รับออเดอร์แล้ว",
  "ส่งชุดพิมพ์แล้ว",
  "รอพิมพ์ฟันส่งกลับ",
  "ได้รับแบบพิมพ์แล้ว",
  "พิมพ์ไม่ผ่าน ต้องส่งชุดใหม่",
  "เทปูนขึ้นรูป",
  "ขึ้นรูปรีเทนเนอร์",
  "ตรวจงานก่อนส่ง",
  "พร้อมส่งคืนลูกค้า",
  "ส่งคืนลูกค้าแล้ว",
  "ปิดงาน"
];

const KANBAN_GROUPS = [
  { title: "เริ่มงาน", statuses: ["รับออเดอร์แล้ว","ส่งชุดพิมพ์แล้ว"] },
  { title: "รอลูกค้า", statuses: ["รอพิมพ์ฟันส่งกลับ","พิมพ์ไม่ผ่าน ต้องส่งชุดใหม่"] },
  { title: "ระหว่างผลิต", statuses: ["ได้รับแบบพิมพ์แล้ว","เทปูนขึ้นรูป","ขึ้นรูปรีเทนเนอร์","ตรวจงานก่อนส่ง"] },
  { title: "ส่งมอบ", statuses: ["พร้อมส่งคืนลูกค้า","ส่งคืนลูกค้าแล้ว","ปิดงาน"] }
];

let currentView = "customer";
let boardMode = "list";
let ORDERS = [];

const $ = id => document.getElementById(id);

function init(){
  $("newStatus").innerHTML = STATUS.map(s => `<option>${s}</option>`).join("");
  $("editStatus").innerHTML = STATUS.map(s => `<option>${s}</option>`).join("");
  $("adminStatusFilter").innerHTML = `<option value="">ทุกสถานะ</option>` + STATUS.map(s => `<option>${s}</option>`).join("");
}
init();

async function callApi(action, payload = {}){
  const url = API_URL + `?action=${encodeURIComponent(action)}&data=${encodeURIComponent(JSON.stringify(payload))}&_=${Date.now()}`;
  const res = await fetch(url);
  return await res.json();
}

function toast(msg){
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 2200);
}

function switchView(view){
  currentView = view;
  $("navCustomer").classList.toggle("active", view === "customer");
  $("navAdmin").classList.toggle("active", view === "admin");
  $("customerView").classList.toggle("active-view", view === "customer");
  $("adminView").classList.toggle("active-view", view === "admin");
  $("heroTitle").textContent = view === "customer" ? "ตรวจสอบสถานะรีเทนเนอร์แบบเรียลไทม์" : "หลังบ้าน Operation แบบพรีเมียม";
  $("heroSub").textContent = view === "customer"
    ? "กรอก HN และ PIN ที่ร้านแจ้งไว้ เพื่อดูสถานะล่าสุด ขั้นตอนถัดไป และวันคาดการณ์"
    : "เพิ่มเคส อัปเดตสถานะ ดูงานค้าง และจัดการ Operation ทั้งหมดในหน้าเดียว";
}

function setBoardMode(mode){
  boardMode = mode;
  $("listTab").classList.toggle("active", mode === "list");
  $("kanbanTab").classList.toggle("active", mode === "kanban");
  $("ordersList").classList.toggle("hidden", mode !== "list");
  $("kanbanBoard").classList.toggle("hidden", mode !== "kanban");
  renderAllBoards();
}

function statusIndex(status){
  const i = STATUS.indexOf(status);
  return i < 0 ? 0 : i;
}

function badgeClass(status){
  if((status || "").includes("ไม่ผ่าน")) return "fail";
  if((status || "").includes("รอพิมพ์")) return "wait";
  if(["ได้รับแบบพิมพ์แล้ว","เทปูนขึ้นรูป","ขึ้นรูปรีเทนเนอร์","ตรวจงานก่อนส่ง"].includes(status)) return "work";
  if(["พร้อมส่งคืนลูกค้า","ส่งคืนลูกค้าแล้ว","ปิดงาน"].includes(status)) return "done";
  return "";
}

function renderTimeline(status){
  const current = statusIndex(status);
  return `<div class="timeline">` + STATUS.map((s,i)=>{
    const cls = i < current ? "done" : (i === current ? "current" : "");
    const mark = i < current ? "✓" : (i === current ? "•" : "");
    return `<div class="step ${cls}"><div class="dot">${mark}</div><div>${s}</div></div>`;
  }).join("") + `</div>`;
}

async function checkStatus(){
  const hn = $("checkHn").value.trim();
  const pin = $("checkPin").value.trim();
  const box = $("customerResult");
  box.className = "customer-result status-card";
  box.innerHTML = "กำลังตรวจสอบ...";
  try{
    const data = await callApi("checkStatus", { hn, pin });
    if(!data.ok) throw new Error(data.message || "ไม่พบข้อมูล");
    const o = data.order;
    box.innerHTML = `
      <h3>${o.customerName || "ลูกค้า Crystal Clear"}</h3>
      <div class="status-pill">${o.status || "-"}</div>
      <p>${o.statusMessage || "ระบบกำลังอัปเดตข้อมูลสถานะงาน"}</p>
      ${renderTimeline(o.status)}
      <div class="info-grid">
        <div class="info"><small>HN</small><strong>${o.hn || "-"}</strong></div>
        <div class="info"><small>สินค้า</small><strong>${o.product || "-"}</strong></div>
        <div class="info"><small>คาดการณ์</small><strong>${o.estimateDate || "-"}</strong></div>
        <div class="info"><small>เลขพัสดุ</small><strong>${o.trackingNo || "-"}</strong></div>
      </div>
      <div class="info" style="margin-top:12px"><small>ขั้นตอนถัดไป</small><strong>${o.nextStep || "-"}</strong></div>
      ${o.publicNote ? `<div class="info" style="margin-top:12px"><small>หมายเหตุจากร้าน</small><strong>${o.publicNote}</strong></div>` : ""}
      ${o.trackingUrl ? `<p style="margin-top:14px"><a href="${o.trackingUrl}" target="_blank">เปิดลิงก์ติดตามพัสดุ</a></p>` : ""}
    `;
  }catch(err){
    box.className = "customer-result status-card error";
    box.innerHTML = `<strong>ตรวจสอบไม่สำเร็จ</strong><br>${err.message}<br><br>กรุณาเช็ก HN/PIN หรือติดต่อร้าน`;
  }
}

async function adminLogin(){
  try{
    const pin = $("adminPinInput").value.trim();
    const data = await callApi("adminLogin", { pin });
    if(!data.ok) throw new Error(data.message || "PIN ไม่ถูกต้อง");
    $("adminLogin").classList.add("hidden");
    $("adminPanel").classList.remove("hidden");
    await loadOrders();
    toast("เข้าสู่หลังบ้านแล้ว");
  }catch(err){
    alert(err.message);
  }
}

async function loadOrders(){
  const data = await callApi("listOrders", {});
  if(!data.ok) return alert(data.message || "โหลดข้อมูลไม่สำเร็จ");
  ORDERS = data.orders || [];
  renderStats();
  renderAllBoards();
}

function renderStats(){
  $("statAll").textContent = ORDERS.length;
  $("statWait").textContent = ORDERS.filter(o => o.status === "รอพิมพ์ฟันส่งกลับ").length;
  $("statFail").textContent = ORDERS.filter(o => o.status === "พิมพ์ไม่ผ่าน ต้องส่งชุดใหม่").length;
  $("statWork").textContent = ORDERS.filter(o => ["ได้รับแบบพิมพ์แล้ว","เทปูนขึ้นรูป","ขึ้นรูปรีเทนเนอร์","ตรวจงานก่อนส่ง"].includes(o.status)).length;
  $("statDone").textContent = ORDERS.filter(o => ["พร้อมส่งคืนลูกค้า","ส่งคืนลูกค้าแล้ว","ปิดงาน"].includes(o.status)).length;
}

function filteredOrders(){
  const q = $("adminSearch")?.value.trim().toLowerCase() || "";
  const sf = $("adminStatusFilter")?.value || "";
  let rows = ORDERS.slice().reverse();
  if(q) rows = rows.filter(o => [o.hn,o.customerName,o.phone,o.product].join(" ").toLowerCase().includes(q));
  if(sf) rows = rows.filter(o => o.status === sf);
  return rows;
}

function renderAllBoards(){
  renderOrdersList();
  renderKanban();
}

function renderOrdersList(){
  const rows = filteredOrders();
  $("ordersList").innerHTML = rows.length ? rows.map(o => `
    <article class="order-row">
      <div>
        <h4>${o.hn} — ${o.customerName || "-"}</h4>
        <div class="meta">
          PIN: ${o.pin || "-"}<br>
          โทร: ${o.phone || "-"}<br>
          สินค้า: ${o.product || "-"}<br>
          อัปเดตล่าสุด: ${o.updatedAt || "-"}
        </div>
      </div>
      <div>
        <span class="badge ${badgeClass(o.status || "")}">${o.status || "-"}</span>
        <div class="meta" style="margin-top:10px">คาดการณ์: ${o.estimateDate || "-"}<br>พัสดุ: ${o.trackingNo || "-"}</div>
      </div>
      <div><button class="primary" onclick="openEdit('${o.hn}')">แก้ไข</button></div>
    </article>
  `).join("") : `<div class="status-card">ยังไม่มีรายการ</div>`;
}

function renderKanban(){
  const rows = filteredOrders();
  $("kanbanBoard").innerHTML = KANBAN_GROUPS.map(group => {
    const items = rows.filter(o => group.statuses.includes(o.status));
    return `
      <section class="kanban-col">
        <h4>${group.title}<span>${items.length}</span></h4>
        ${items.map(o => `
          <article class="k-card" onclick="openEdit('${o.hn}')">
            <strong>${o.hn}</strong>
            <small>${o.customerName || "-"}<br>${o.status || "-"}<br>${o.estimateDate || ""}</small>
          </article>
        `).join("") || `<div class="meta">ไม่มีงานในกลุ่มนี้</div>`}
      </section>
    `;
  }).join("");
}

function nextHN(){
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const prefix = `HN-${yy}${mm}-`;
  const max = ORDERS.map(o => String(o.hn || ""))
    .filter(h => h.startsWith(prefix))
    .map(h => Number(h.split("-").pop() || 0))
    .reduce((a,b) => Math.max(a,b), 0);
  return prefix + String(max + 1).padStart(4,"0");
}

function clearNewForm(){
  ["newHn","newPin","newName","newPhone","newEstimate","newTracking","newMessage","newNextStep"].forEach(id => $(id).value = "");
  $("newProduct").value = "Clear Retainer บน+ล่าง";
  $("newStatus").value = "รับออเดอร์แล้ว";
}

async function createOrder(){
  const payload = {
    hn: $("newHn").value.trim() || nextHN(),
    pin: $("newPin").value.trim() || "1234",
    customerName: $("newName").value.trim(),
    phone: $("newPhone").value.trim(),
    product: $("newProduct").value,
    status: $("newStatus").value,
    estimateDate: $("newEstimate").value.trim(),
    trackingNo: $("newTracking").value.trim(),
    statusMessage: $("newMessage").value.trim(),
    nextStep: $("newNextStep").value.trim()
  };
  if(!payload.customerName) return alert("กรุณาใส่ชื่อลูกค้า");
  const data = await callApi("createOrder", payload);
  if(!data.ok) return alert(data.message || "เพิ่มไม่สำเร็จ");
  clearNewForm();
  await loadOrders();
  toast(`เพิ่มเคสแล้ว: ${payload.hn}`);
}

function openEdit(hn){
  const o = ORDERS.find(x => x.hn === hn);
  if(!o) return;
  $("editTitle").textContent = o.hn || "";
  $("editHn").value = o.hn || "";
  $("editPin").value = o.pin || "";
  $("editName").value = o.customerName || "";
  $("editPhone").value = o.phone || "";
  $("editProduct").value = o.product || "Clear Retainer บน+ล่าง";
  $("editStatus").value = o.status || "รับออเดอร์แล้ว";
  $("editEstimate").value = o.estimateDate || "";
  $("editTracking").value = o.trackingNo || "";
  $("editTrackingUrl").value = o.trackingUrl || "";
  $("editMessage").value = o.statusMessage || "";
  $("editNextStep").value = o.nextStep || "";
  $("editPublicNote").value = o.publicNote || "";
  $("editPrivateNote").value = o.privateNote || "";
  $("editModal").showModal();
}

function closeEdit(){ $("editModal").close(); }

async function saveEdit(){
  const payload = {
    hn: $("editHn").value,
    pin: $("editPin").value.trim(),
    customerName: $("editName").value.trim(),
    phone: $("editPhone").value.trim(),
    product: $("editProduct").value,
    status: $("editStatus").value,
    estimateDate: $("editEstimate").value.trim(),
    trackingNo: $("editTracking").value.trim(),
    trackingUrl: $("editTrackingUrl").value.trim(),
    statusMessage: $("editMessage").value.trim(),
    nextStep: $("editNextStep").value.trim(),
    publicNote: $("editPublicNote").value.trim(),
    privateNote: $("editPrivateNote").value.trim()
  };
  const data = await callApi("updateOrderFull", payload);
  if(!data.ok) return alert(data.message || "บันทึกไม่สำเร็จ");
  closeEdit();
  await loadOrders();
  toast("บันทึกแล้ว");
}

async function archiveOrder(){
  if(!confirm("ต้องการซ่อนเคสนี้จากรายการหลังบ้านใช่ไหม?")) return;
  const hn = $("editHn").value;
  const data = await callApi("archiveOrder", { hn });
  if(!data.ok) return alert(data.message || "ซ่อนไม่สำเร็จ");
  closeEdit();
  await loadOrders();
  toast("ซ่อนเคสแล้ว");
}
