// นำเข้าโมดูลที่จำเป็น
const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('./config/configdatabase');

// สร้างแอป Express
const app = express();

// ฟังก์ชันตรวจสอบโทเค็น
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // ตรวจสอบโทเค็น
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
};

// เพื่อให้ Express สามารถเข้าใจข้อมูล JSON ที่ส่งมาจากลูกค้า
app.use(express.json());


// API endpoint สำหรับการแก้ไขข้อมูลของผู้ใช้งาน
app.put('/:userid', verifyToken, (req, res) => {
    const { userid } = req.params;
    const { email, name, lastname, tel, adminType } = req.body;

    // คำสั่ง SQL สำหรับการอัปเดตข้อมูลผู้ใช้งาน
    const query = `
        UPDATE user 
        SET email = ?, name = ?, lastname = ?, tel = ?, adminType = ?
        WHERE userid = ?
    `;

    // ดำเนินการคำสั่ง SQL ด้วย `callback`
    pool.query(query, [email, name, lastname, tel, adminType, userid], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                // กรณีที่อีเมลซ้ำ
                res.status(400).json({ error: 'Email already exists' });
            } else {
                // กรณีข้อผิดพลาดอื่น ๆ
                console.error('Database error:', err);
                res.status(500).json({ error: 'Database error' });
            }
        } else {
            // ตรวจสอบว่ามีการอัปเดตแถวหรือไม่
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // หากอัปเดตสำเร็จ ส่งการตอบกลับ
            res.status(200).json({ message: 'User updated successfully' });
        }
    });
});



// ส่งออกโมดูล
module.exports = app;
