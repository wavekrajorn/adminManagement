// นำเข้าโมดูลที่จำเป็น
const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('./config/configdatabase');
const app = express();

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

app.get('/', verifyToken, (req, res) => {
    // คำสั่ง SQL เพื่อดึงข้อมูล admin รวม name, tel, adminType, profilePic, lastname และ profilePic
    const query = `
        SELECT userid, email, name, lastname, tel, adminType, profilePic, isAdmin
        FROM user
        WHERE isAdmin = ?
    `;
    const isAdmin = 1;

    pool.query(query, [isAdmin], (err, results) => {
        if (err) {
            // หากเกิดข้อผิดพลาดระหว่างการ query
            res.status(500).json({ error: 'Database query error' });
        } else {
            // ส่งผลลัพธ์เป็น JSON กลับ
            res.json(results);
        }
    });
});


// ส่งออกโมดูล
module.exports = app;
