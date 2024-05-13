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

// เส้นทาง DELETE สำหรับการลบผู้ดูแลระบบ
app.delete('/:userid', verifyToken, (req, res) => {
    // ดึง `userid` จากพารามิเตอร์ของเส้นทาง
    const { userid } = req.params;

    // คำสั่ง SQL สำหรับการลบผู้ใช้งานตาม `userid`
    const query = 'DELETE FROM user WHERE userid = ? AND isAdmin = 1';
    
    // ดำเนินการคำสั่ง SQL
    pool.query(query, [userid], (err, results) => {
        if (err) {
            // ส่งสถานะ HTTP 500 หากเกิดข้อผิดพลาด
            res.status(500).json({ error: 'Database error' });
        } else if (results.affectedRows === 0) {
            // หากไม่มีแถวใดที่ถูกลบ แสดงว่ามีปัญหา
            res.status(404).json({ error: 'User not found or not an admin' });
        } else {
            // ลบสำเร็จ ส่งสถานะ HTTP 200
            res.status(200).json({ message: 'Admin deleted successfully' });
        }
    });
});

// ส่งออกโมดูล
module.exports = app;
