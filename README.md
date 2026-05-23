# Crystal Clear Back Office — GitHub Pages Full Version

เว็บหลังบ้านสำหรับร้าน **Crystal Clear Clear Retainer** แบบ Premium UI ใช้งานบน GitHub Pages และเก็บข้อมูลจริงใน Google Sheets ผ่าน Google Apps Script

## สิ่งที่มีในระบบ

- Dashboard งานค้าง / รอพิมพ์ฟัน / พิมพ์ไม่ผ่าน / ระหว่างทำ / พร้อมส่ง
- ระบบลูกค้าแยก HN อัตโนมัติ เช่น `HN-2605-0001`
- เปิดออเดอร์ Clear Retainer ราคาขายแก้เองทุกเคส
- Pipeline สถานะงานตั้งแต่ลูกค้ากดสั่งถึงปิดงาน
- บันทึกต้นทุนต่อเคส เช่น ชุดพิมพ์ ค่าส่ง ปูน วัสดุ กล่อง งานทำใหม่
- บันทึกรายรับต่อออเดอร์
- Media Gallery เก็บรูปพิมพ์ปูน ตัวรีเทนเนอร์ สลิป และรูปรีวิว
- เชื่อม Google Sheet เป็นฐานข้อมูล
- อัปโหลดรูปเข้า Google Drive ผ่าน Apps Script
- แจ้งเตือน LINE ผ่าน LINE Messaging API
- Demo Local Mode ใช้ทดสอบได้ทันทีโดยไม่ต้องต่อ API

## โครงสร้างไฟล์

```text
crystal-clear-github-full/
├── index.html
├── style.css
├── app.js
├── config.js
├── assets/
│   └── logo.jpeg
└── apps-script/
    └── Code.gs
```

## วิธีอัปขึ้น GitHub Pages

1. สร้าง Repository ใหม่ใน GitHub เช่น `crystal-clear-backoffice`
2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้น repo
3. ไปที่ `Settings > Pages`
4. Source เลือก `Deploy from a branch`
5. Branch เลือก `main` และ Folder เลือก `/root`
6. กด Save
7. รอ GitHub สร้างลิงก์เว็บ เช่น `https://username.github.io/crystal-clear-backoffice/`

> ถ้ายังไม่ใส่ API URL เว็บจะทำงานใน Demo Local Mode ก่อน ข้อมูลจะอยู่ใน browser เครื่องนั้น

## วิธีต่อ Google Sheet จริง

### 1) เปิด Google Sheet Database

ใช้ไฟล์ที่สร้างไว้แล้ว:

`Crystal Clear Back Office - Database`

Spreadsheet ID:

```text
1RRetRcaHswh-sUX6liGv8-Crmm3p2vV-VoKalQSacCk
```

### 2) สร้าง Apps Script

1. เปิด Google Sheet
2. ไปที่ `Extensions > Apps Script`
3. ลบโค้ดเดิมใน `Code.gs`
4. Copy โค้ดจาก `apps-script/Code.gs` ไปวาง
5. กด Save
6. กด Run ฟังก์ชัน `setupSheets` หนึ่งครั้ง และอนุญาตสิทธิ์

### 3) Deploy API

1. กด `Deploy > New deployment`
2. เลือก Type เป็น `Web app`
3. Description: `Crystal Clear API`
4. Execute as: `Me`
5. Who has access: `Anyone`
6. กด Deploy
7. Copy Web app URL ที่ลงท้าย `/exec`

### 4) ใส่ API URL ในเว็บ

เลือกได้ 2 วิธี

**วิธีที่ 1 แก้ใน GitHub:**

เปิดไฟล์ `config.js` แล้วใส่ URL:

```js
window.CRYSTAL_CONFIG = {
  API_URL: "https://script.google.com/macros/s/xxxxxxxx/exec",
  STORE_NAME: "Crystal Clear",
  HN_PREFIX: "HN",
  ORDER_PREFIX: "CC",
  CURRENCY: "THB"
};
```

**วิธีที่ 2 ใส่จากหน้าเว็บ:**

1. เปิดเว็บ
2. ไปที่เมนู `ตั้งค่า`
3. วาง Google Apps Script Web App URL
4. กด `บันทึก URL`
5. กด `ทดสอบ API`

## วิธีตั้งค่า LINE แจ้งเตือน

ใน Google Sheet แท็บ `Settings` ใส่ค่า:

| key | value |
|---|---|
| lineChannelAccessToken | Long-lived Channel Access Token |
| lineUserId | User ID ที่จะรับแจ้งเตือน |

ระบบจะแจ้งเตือนเมื่อ:

- เปิดออเดอร์ใหม่
- รอพิมพ์ฟันส่งกลับ
- พิมพ์ไม่ผ่าน ต้องส่งชุดใหม่
- พร้อมส่งคืนลูกค้า
- ส่งคืนลูกค้าแล้ว
- ปิดงาน

## คำแนะนำการใช้งานจริง

1. เริ่มจากเพิ่มลูกค้าก่อน เพื่อสร้าง HN
2. เปิดออเดอร์ Clear Retainer จาก HN นั้น
3. เปลี่ยนสถานะงานตามขั้นตอนจริงของร้าน
4. บันทึกต้นทุนทุกครั้ง เช่น ค่าส่ง ชุดพิมพ์ ปูน วัสดุ
5. บันทึกรายรับเมื่อมีการโอนหรือชำระเงิน
6. อัปโหลดรูปโมเดลปูน/ตัวรีเทนเนอร์เพื่อเก็บไว้ทำรีวิว

## สถานะงานที่ระบบใช้

```text
ลูกค้ากดสั่ง
ส่งชุดพิมพ์ให้ลูกค้า
รอพิมพ์ฟันส่งกลับ
ได้รับแบบพิมพ์แล้ว
พิมพ์ไม่ผ่าน ต้องส่งชุดใหม่
เทปูนขึ้นรูป
ขึ้นรูปรีเทนเนอร์
ตรวจงาน QC
พร้อมส่งคืนลูกค้า
ส่งคืนลูกค้าแล้ว
ปิดงาน
ยกเลิก
```

## หมายเหตุสำคัญ

- เว็บนี้เป็น Static Website สำหรับ GitHub Pages
- ฐานข้อมูลจริงอยู่ที่ Google Sheets
- รูปที่อัปโหลดจะถูกเก็บใน Google Drive ผ่าน Apps Script
- ไม่ควรใส่ LINE Token ใน GitHub ให้ใส่ใน Google Sheet แท็บ `Settings` เท่านั้น
- หากเปิดแบบไม่ต่อ API จะเป็น Demo Local Mode ข้อมูลอยู่เฉพาะเครื่องนั้น
