# Blackmagic URSA Broadcast G2 Camera Control Dashboard

Dashboard สำหรับควบคุมกล้อง Blackmagic URSA Broadcast G2 ผ่านเครือข่าย IP

## คุณสมบัติ

- **การควบคุมการบันทึก**: Start/Stop Recording
- **การแสดงสถานะ**: Record Status, Recording Time, Connection Status
- **ข้อมูลรูปแบบการบันทึก**: Codec, Frame Rate, Resolution, Off Speed
- **ข้อมูล Timecode**: Current Timecode (แปลงจาก BCD เป็นรูปแบบ HH:MM:SS:FF)
- **Auto-Connect**: เชื่อมต่ออัตโนมัติและอัปเดตข้อมูลทุก 5 วินาที
- **Real-time Status Monitoring**: ตรวจสอบสถานะกล้องทุก 2 วินาที
- **Auto-Reconnection**: เชื่อมต่อใหม่อัตโนมัติเมื่อการเชื่อมต่อขาดหาย
- **Fast Offline Detection**: ตรวจจับการขาดการเชื่อมต่อภายใน 3 วินาที
- **Responsive Design**: รองรับการใช้งานบนอุปกรณ์ต่างๆ

## การติดตั้ง

1. ดาวน์โหลดไฟล์ทั้งหมดไปยังโฟลเดอร์เดียวกัน
2. เปิดไฟล์ `index.html` ในเว็บเบราว์เซอร์
3. Dashboard จะเชื่อมต่ออัตโนมัติกับกล้องที่ IP 192.168.8.202 ภายใน 1 วินาที
4. ข้อมูลจะอัปเดตทุก 5 วินาทีโดยอัตโนมัติ

## การใช้งาน

### การเชื่อมต่อ
- Dashboard จะเชื่อมต่ออัตโนมัติกับกล้องที่ IP 192.168.8.202
- สถานะการเชื่อมต่อจะแสดงเป็นสีเขียวเมื่อเชื่อมต่อสำเร็จ
- มีการเชื่อมต่อใหม่อัตโนมัติเมื่อการเชื่อมต่อขาดหาย

### การบันทึก
- กดปุ่ม "Record" เพื่อเริ่มบันทึก (ส่ง `PUT {"recording": true}`)
- กดปุ่ม "Stop" เพื่อหยุดบันทึก (ส่ง `PUT {"recording": false}`)
- Current Timecode จะแสดงในรูปแบบ HH:MM:SS:FF
- สถานะการบันทึกจะอัปเดตจาก API `GET /control/api/v1/transports/0/record`



## API Endpoints

Dashboard นี้ใช้ API endpoints ต่อไปนี้:

- `GET /control/api/v1/control/api/v1` - ตรวจสอบสถานะการเชื่อมต่อ (Status Check)
- `GET /control/api/v1/system/format` - ข้อมูลรูปแบบการบันทึก (Codec, Frame Rate, Resolution)
- `GET /control/api/v1/transports/0/timecode` - ข้อมูล Timecode ปัจจุบัน (แปลงจาก BCD เป็นรูปแบบ HH:MM:SS:FF)
- `GET /control/api/v1/transports/0/record` - สถานะการบันทึก
- `PUT /control/api/v1/transports/0/record` - ควบคุมการบันทึก (recording: true/false)

## ข้อกำหนดระบบ

- เว็บเบราว์เซอร์ที่รองรับ ES6+ (Chrome, Firefox, Safari, Edge)
- การเชื่อมต่อเครือข่ายกับกล้อง
- กล้องต้องเปิดใช้งาน Network Control

## การแก้ไขปัญหา

### ไม่สามารถเชื่อมต่อได้
1. ตรวจสอบ IP Address ของกล้อง
2. ตรวจสอบการเชื่อมต่อเครือข่าย
3. ตรวจสอบว่า Network Control เปิดใช้งานบนกล้อง

### การบันทึกไม่ทำงาน
1. ตรวจสอบสถานะการเชื่อมต่อ
2. ตรวจสอบการตั้งค่ากล้อง
3. ตรวจสอบ Activity Log สำหรับข้อผิดพลาด

## การพัฒนา

Dashboard นี้สร้างด้วย:
- HTML5
- CSS3 (with Flexbox and Grid)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons

## การปรับแต่ง

คุณสามารถปรับแต่ง Dashboard ได้โดย:
- แก้ไขไฟล์ `styles.css` สำหรับการออกแบบ
- แก้ไขไฟล์ `script.js` สำหรับฟังก์ชันการทำงาน
- เพิ่ม API endpoints ใหม่ใน `script.js`

## การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ กรุณาตรวจสอบ:
1. Activity Log ใน Dashboard
2. Console ของเว็บเบราว์เซอร์
3. การตั้งค่าเครือข่ายของกล้อง

## หมายเหตุ

- Dashboard นี้ใช้สำหรับการควบคุมกล้องผ่านเครือข่าย IP เท่านั้น
- ต้องมีการตั้งค่าเครือข่ายที่ถูกต้อง
- แนะนำให้ใช้ในเครือข่ายที่ปลอดภัย 