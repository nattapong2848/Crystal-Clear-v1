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

let ORDERS = [];
let ADMIN_OK = false;

const $ = id => document.getElementById(id);

function init(){
  $("newStatus").innerHTML = STATUS.map(s=>`<option>${s}</option>`).join("");
  $("adminStatusFilter").innerHTML = `<option value="">ทุกสถานะ</option>` + STATUS.map(s=>`<option>${s}</option>`).join("");
}
init();

function apiUrl(){
  return (window.API_URL || "").trim();
}

async function callApi(action, payload={}){
  if(!apiUrl()){
    throw new Error("ยังไม่ได้ใส่ API URL ในไฟล์ config.js");
  }
  const url = apiUrl() + `?action=${encodeURIComponent(action)}&data=${encodeURIComponent(JSON.stringify(payload))}`;
  const res = await fetch(url);
  return await res.json();
}

function switchMode(mode){
  $("customerTab").classList.toggle("active", mode==="customer");
  $("adminTab").classList.toggle("active", mode==="admin");
  $("customerBox").classList.toggle("hidden", mode!=="customer");
  $("adminBox").classList.toggle("hidden", mode!=="admin");
}

function statusIndex(status){
  const i = STATUS.indexOf(status);
  return i < 0 ? 0 : i;
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
  box.className = "result";
  box.innerHTML = "กำลังตรวจสอบ...";
  try{
    const data = await callApi("checkStatus", {hn, pin});
    if(!data.ok) throw new Error(data.message || "ไม่พบข้อมูล");
    const o = data.order;
    box.innerHTML = `
      <div class="status-card">
        <h2>${o.customerName || "ลูกค้า Crystal Clear"}</h2>
        <div class="status-pill">${o.status}</div>
        <p>${o.statusMessage || "ระบบกำลังอัปเดตข้อมูลสถานะงาน"}</p>
        ${renderTimeline(o.status)}
        <div class="info-grid">
          <div class="info"><small>HN</small><strong>${o.hn}</strong></div>
          <div class="info"><small>สินค้า</small><strong>${o.product || "-"}</strong></div>
          <div class="info"><small>คาดว่าจะอัปเดต/เสร็จ</small><strong>${o.estimateDate || "-"}</strong></div>
          <div class="info"><small>เลขพัสดุ</small><strong>${o.trackingNo || "-"}</strong></div>
        </div>
        <div class="info" style="margin-top:12px"><small>ขั้นตอนถัดไป</small><strong>${o.nextStep || "-"}</strong></div>
        ${o.publicNote ? `<div class="info" style="margin-top:12px"><small>หมายเหตุจากร้าน</small><strong>${o.publicNote}</strong></div>` : ""}
        ${o.trackingUrl ? `<p style="margin-top:14px"><a href="${o.trackingUrl}" target="_blank">เปิดลิงก์ติดตามพัสดุ</a></p>` : ""}
      </div>
    `;
  }catch(err){
    box.className = "result error";
    box.innerHTML = `<strong>ตรวจสอบไม่สำเร็จ</strong><br>${err.message}<br><br>กรุณาเช็ก HN/PIN หรือติดต่อร้าน`;
  }
}

async function adminLogin(){
  try{
    const pin = $("adminPinInput").value.trim();
    const data = await callApi("adminLogin", {pin});
    if(!data.ok) throw new Error(data.message || "PIN ไม่ถูกต้อง");
    ADMIN_OK = true;
    $("adminLogin").classList.add("hidden");
    $("adminPanel").classList.remove("hidden");
    await loadOrders();
  }catch(err){
    alert(err.message);
  }
}

async function loadOrders(){
  const data = await callApi("listOrders", {});
  if(!data.ok) return alert(data.message || "โหลดข้อมูลไม่สำเร็จ");
  ORDERS = data.orders || [];
  renderOrders();
}

function renderOrders(){
  const q = $("adminSearch").value.trim().toLowerCase();
  const sf = $("adminStatusFilter").value;
  let rows = ORDERS.slice().reverse();
  if(q) rows = rows.filter(o => [o.hn,o.customerName,o.phone,o.product].join(" ").toLowerCase().includes(q));
  if(sf) rows = rows.filter(o => o.status === sf);

  $("ordersList").innerHTML = rows.length ? rows.map(o=>`
    <div class="order-row">
      <div>
        <h3>${o.hn} — ${o.customerName || "-"}</h3>
        <div class="meta">${o.phone || "-"}<br>${o.product || "-"}<br>อัปเดตล่าสุด: ${o.updatedAt || "-"}</div>
      </div>
      <div>
        <label>สถานะ
          <select id="st_${o.hn}">${STATUS.map(s=>`<option ${s===o.status?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label>คาดการณ์วันที่
          <input id="date_${o.hn}" value="${o.estimateDate || ""}" placeholder="เช่น 26/05/2026">
        </label>
      </div>
      <div class="row-actions">
        <label>ข้อความให้ลูกค้าเห็น
          <textarea id="msg_${o.hn}">${o.statusMessage || ""}</textarea>
        </label>
        <button class="primary" onclick="updateOrder('${o.hn}')">บันทึกสถานะ</button>
      </div>
    </div>
  `).join("") : `<div class="result">ยังไม่มีรายการ</div>`;
}

function nextHN(){
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const count = ORDERS.filter(o => String(o.hn).includes(`HN-${yy}${mm}`)).length + 1;
  return `HN-${yy}${mm}-${String(count).padStart(4,"0")}`;
}

async function createOrder(){
  const payload = {
    hn: $("newHn").value.trim() || nextHN(),
    pin: $("newPin").value.trim() || "1234",
    customerName: $("newName").value.trim(),
    phone: $("newPhone").value.trim(),
    product: $("newProduct").value.trim() || "Clear Retainer",
    status: $("newStatus").value,
    statusMessage: $("newMessage").value.trim(),
    nextStep: $("newNextStep").value.trim()
  };
  const data = await callApi("createOrder", payload);
  if(!data.ok) return alert(data.message || "เพิ่มไม่สำเร็จ");
  ["newHn","newPin","newName","newPhone","newMessage","newNextStep"].forEach(id=>$(id).value="");
  $("newProduct").value = "Clear Retainer";
  await loadOrders();
  alert(`เพิ่มเคสแล้ว: ${payload.hn}`);
}

async function updateOrder(hn){
  const payload = {
    hn,
    status: $(`st_${hn}`).value,
    statusMessage: $(`msg_${hn}`).value.trim(),
    estimateDate: $(`date_${hn}`).value.trim()
  };
  const data = await callApi("updateOrder", payload);
  if(!data.ok) return alert(data.message || "อัปเดตไม่สำเร็จ");
  await loadOrders();
  alert("บันทึกแล้ว");
}
