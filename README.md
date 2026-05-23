# Crystal Clear Ultra Status System

เวอร์ชั่นเต็ม กราฟฟิกลูกเล่นจัดเต็ม แต่ยังเน้น Operation ใช้งานจริง

## มีอะไรบ้าง

- ลูกค้าเช็คสถานะด้วย HN + PIN
- Timeline สถานะสวย ๆ
- หลังบ้านด้วย Admin PIN
- Dashboard งานค้าง
- เพิ่มเคส
- แก้ไขเคสเต็ม
- Kanban Board
- ค้นหา/กรองสถานะ
- ใส่เลขพัสดุและ Tracking URL
- ซ่อนเคส
- โลโก้ฝังในหน้าเว็บ ไม่ต้องใช้ assets
- ไม่ใช้ config.js แล้ว เพื่อตัดปัญหา API URL ไม่อัปเดต

## ไฟล์ที่ต้องอัปขึ้น GitHub

- index.html
- style.css
- app.js
- README.md

## Google Apps Script

เอาไฟล์นี้ไปวางใน Apps Script:

- apps-script/Code.gs

จากนั้นกด Deploy ใหม่ หรือ Manage deployments > Edit > New version

## API URL ที่ใส่ใน app.js แล้ว

https://script.google.com/macros/s/AKfycbx8o0Fb7XvANoagptA795gdYhvbnsVC4sYNoxsSEP6HpaHFPEKgh1_GMe5AYgyrBZNgsA/exec

## Google Sheet

https://docs.google.com/spreadsheets/d/1d7e3a7KlDN_czftMrT6byGiDyaxLLDLUwSqBKlWrqUo/edit

## ข้อมูลทดสอบ

HN: HN-2605-0001  
PIN: 1234

Admin PIN: 2468
