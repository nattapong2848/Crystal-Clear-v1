# Crystal Clear Operation Status Site

เว็บใหม่แบบไม่รก เน้น Operation อย่างเดียว:

1. ลูกค้าเช็คสถานะได้ด้วย HN + PIN
2. ร้านเพิ่มเคสใหม่ได้
3. ร้านอัปเดตสถานะได้
4. ข้อมูลเก็บใน Google Sheet

## Google Sheet ที่สร้างให้แล้ว

https://docs.google.com/spreadsheets/d/1d7e3a7KlDN_czftMrT6byGiDyaxLLDLUwSqBKlWrqUo/edit

## วิธีอัปขึ้น GitHub Pages

1. สร้าง Repository ใหม่ เช่น `crystal-clear-status`
2. อัปโหลดไฟล์:
   - index.html
   - style.css
   - app.js
   - config.js
   - apps-script/Code.gs
3. ไปที่ Settings > Pages
4. Source เลือก Deploy from a branch
5. Branch เลือก main / root
6. รอลิงก์เว็บ

## วิธีต่อ Google Sheet

1. เปิด Google Sheet ที่สร้างให้
2. ไปที่ Extensions > Apps Script
3. วางโค้ดจาก `apps-script/Code.gs`
4. Deploy > New deployment > Web app
5. Execute as: Me
6. Who has access: Anyone
7. Copy Web App URL
8. เปิดไฟล์ `config.js`
9. ใส่ URL แบบนี้:

```js
window.API_URL = "https://script.google.com/macros/s/xxxx/exec";
```

10. อัปไฟล์ config.js กลับขึ้น GitHub

## วิธีให้ลูกค้าเช็ค

ส่งให้ลูกค้า:
- ลิงก์เว็บ
- HN เช่น HN-2605-0001
- PIN เช่น 1234

## Admin PIN

ค่าเริ่มต้นคือ `2468`

เปลี่ยนได้ที่ Google Sheet > Settings > adminPin
