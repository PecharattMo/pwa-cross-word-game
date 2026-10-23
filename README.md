# WanderWords

เกม PWA crossword สำหรับคนไทยที่ต้องการฝึกคำศัพท์อังกฤษที่ใช้ระหว่างท่องเที่ยว ร้านอาหาร การเดินทาง ที่พัก และสถานที่ท่องเที่ยว

## สิ่งที่เล่นได้ในเวอร์ชันแรก

- ใส่ชื่อผู้เล่นแล้วเริ่มได้ทันที ไม่ต้องสมัครสมาชิก
- 4 หมวด: Food, Travel, Accommodations และ Attractions
- Easy 60 วินาที, Medium 120 วินาที และ Hard 180 วินาที
- แต่ละด่านมี 6–7 คำ และไม่เกิน 15 คำ
- มี definition ภาษาอังกฤษเป็นคำใบ้ และมีคำแปลไทยหลังผ่านด่าน
- คำเดิมให้คะแนนเพียงครั้งแรก ครั้งละ 1 คะแนน
- แสดงคะแนนแยกหมวดและคะแนนรวม
- มีคำศัพท์ไม่ซ้ำ 1,072 คำ พร้อมคำแปลไทยและคำใบ้ภาษาอังกฤษ
- เมื่อตอบไม่ทัน จะแสดงคำที่ตอบถูก ดูเฉลยได้ และต้องเริ่มด่านเดิมใหม่
- ติดตั้งบนหน้าจอมือถือและเล่นออฟไลน์ได้หลังเปิดเว็บครั้งแรก

## ทดลองในเครื่อง

```bash
npm install
npm run dev
```

เปิด `http://localhost:5173/pwa-cross-word-game/`

## การตรวจคุณภาพ

```bash
npm test
npm run typecheck
npm run build
```

- `test` ตรวจตรรกะเวลา คะแนน คำซ้ำ กระดาน crossword คำแปล และขนาดคลังคำ
- `typecheck` ตรวจว่าชนิดข้อมูล TypeScript สอดคล้องกัน
- `build` สร้างไฟล์ production ในโฟลเดอร์ `dist` รวม manifest และ service worker สำหรับ offline

## จากโค้ดไปเป็นเว็บไซต์จริง

ไฟล์ `.github/workflows/deploy.yml` คือรายการงานอัตโนมัติของ GitHub Actions เมื่อมีการ push เข้า `main`:

1. ดาวน์โหลดโค้ดจาก repository
2. ติดตั้ง dependency ตาม `package-lock.json`
3. รัน test และ TypeScript check
4. build PWA
5. ส่งไฟล์ใน `dist` ไปยัง GitHub Pages

ถ้าขั้นใดล้มเหลว GitHub จะไม่ deploy เวอร์ชันนั้น จึงช่วยกันไม่ให้โค้ดที่พังขึ้นเว็บจริง

## ข้อมูลคำศัพท์

ดูแหล่งข้อมูลและ license ที่ [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
