# Crystal Clear Web System

## หน้าเว็บ
- `index.html` = หน้าหลักลูกค้าเช็คสถานะ
- `register.html` = ลูกค้ากรอกข้อมูลเองและสร้างออเดอร์
- `login.html` = หน้า Login แอดมิน
- `admin.html` = Seller Portal หลังบ้าน

## Login Demo
Username: `admin`
Password: `1234`

## Google Sheet
สร้างไว้แล้ว: https://docs.google.com/spreadsheets/d/1x00ZZweul36bYY7ofIeBDt66E29UZvpDXBHJobFNCDQ/edit

## วิธีต่อ Google Sheet จริง
1. เปิด Google Sheet
2. Extensions > Apps Script
3. วางโค้ดจาก `apps-script/Code.gs`
4. Deploy > New deployment > Web app
5. Execute as: Me
6. Who has access: Anyone
7. Copy Web App URL
8. เปิด `config.js` แล้วใส่ URL ใน `API_URL`

ถ้ายังไม่ใส่ API_URL ระบบจะใช้ LocalStorage สำหรับทดลองหน้าเว็บก่อน
