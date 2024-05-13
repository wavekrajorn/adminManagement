const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // นำเข้า multer
const pool = require('./config/configdatabase');

const app = express();

// กำหนดที่เก็บไฟล์และชื่อไฟล์สำหรับ multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // กำหนดที่เก็บไฟล์
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // กำหนดชื่อไฟล์
    }
});
const upload = multer({ storage: storage }); // สร้าง multer instance



// ฟังก์ชันตรวจสอบโทเค็น
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
};

app.post('/', verifyToken, upload.single('profilePic'), (req, res) => {
    const { email, name, lastname, tel, adminType } = req.body;

    // เพิ่มข้อมูลใหม่ลงในตาราง user
    const insertQuery = `
        INSERT INTO user (email, name, lastname, tel, adminType, isAdmin)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    pool.query(insertQuery, [email, name, lastname, tel, adminType, 1], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                // กรณีที่เกิดข้อผิดพลาด `ER_DUP_ENTRY` ซึ่งหมายถึงอีเมลซ้ำ
                console.log("Email already exists")
                res.status(400).send('Email already exists');


            } else {
                // กรณีข้อผิดพลาดอื่น ๆ
                console.error('Database error:', err);
                // res.status(500).json({ error: 'Database error' });
                res.status(500).send('Database error');
                
            }
        } else {
            // เพิ่มข้อมูลสำเร็จ
            res.status(201).json({ message: 'Admin added successfully' });
        }
    });
});




module.exports = app;
