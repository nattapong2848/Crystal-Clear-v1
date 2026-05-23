# Deploy Checklist — Crystal Clear Back Office

## GitHub

- [ ] สร้าง GitHub repository ใหม่
- [ ] Upload `index.html`, `style.css`, `app.js`, `config.js`, `assets/`, `apps-script/`
- [ ] เปิด GitHub Pages ที่ `Settings > Pages`
- [ ] เลือก branch `main` และ folder `/root`
- [ ] เปิดลิงก์เว็บแล้วเห็นหน้า Dashboard

## Google Apps Script

- [ ] เปิด Google Sheet Database
- [ ] ไปที่ `Extensions > Apps Script`
- [ ] วางโค้ด `apps-script/Code.gs`
- [ ] Run `setupSheets`
- [ ] Deploy เป็น Web app
- [ ] Who has access = Anyone
- [ ] Copy URL ที่ลงท้าย `/exec`

## เชื่อมเว็บกับ API

- [ ] เปิดหน้าเว็บ GitHub Pages
- [ ] ไปเมนู `ตั้งค่า`
- [ ] วาง Web App URL
- [ ] กดบันทึก URL
- [ ] กดทดสอบ API แล้วขึ้น API ready

## Test Flow

- [ ] เพิ่มลูกค้าใหม่
- [ ] เห็น HN ในชีท `Customers`
- [ ] เปิดออเดอร์ Clear Retainer
- [ ] เห็นออเดอร์ในชีท `Orders`
- [ ] เปลี่ยนสถานะเป็น `รอพิมพ์ฟันส่งกลับ`
- [ ] เปลี่ยนสถานะเป็น `พิมพ์ไม่ผ่าน ต้องส่งชุดใหม่`
- [ ] Dashboard นับตัวเลขถูกต้อง
- [ ] บันทึกต้นทุน
- [ ] บันทึกรายรับ
- [ ] อัปโหลดรูปแล้วเห็นลิงก์ในชีท `Media`

## LINE

- [ ] ใส่ `lineChannelAccessToken` ในชีท Settings
- [ ] ใส่ `lineUserId` ในชีท Settings
- [ ] ทดสอบเปิดออเดอร์ใหม่แล้วมี LINE แจ้งเตือน
