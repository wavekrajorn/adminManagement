const router = require("express").Router();
const passport = require("passport");
const pool = require("./config/configdatabase"); // เชื่อมต่อฐานข้อมูล
require('dotenv').config();
const jwt = require('jsonwebtoken'); // เพิ่มการนำเข้า jsonwebtoken
const { SECRET } = process.env


router.get("/login/success", (req, res) => {
    // ตรวจสอบว่ามีข้อมูล req.user หรือไม่
    if (!req.user || !req.user.email) {
        res.status(403).json({ error: true, message: "Not Authorized" });
        return;
    }

    const email = req.user.email;

    // ใช้ pool เพื่อดำเนินการคำสั่ง SQL
    pool.query('SELECT isAdmin FROM user WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            res.status(500).json({
                error: true,
                message: "Server error",
            });
        } else {
            // ตรวจสอบว่าพบข้อมูลผู้ใช้หรือไม่
            if (results.length > 0) {
                // หากพบผู้ใช้
                const isAdmin = results[0].isAdmin;
                
                // ตรวจสอบค่า isAdmin
                if (isAdmin === 1) {
                    const token = jwt.sign(
                    { role: 'admin' }, 
                    SECRET, 
                    { expiresIn: '2h' } 
                    );
                    res.status(200).json({ token });
                } else {
                    const token = jwt.sign(
                    { role: 'user' }, 
                    SECRET, 
                    { expiresIn: '2h' } 
                    );
                    res.status(200).json({ token });
                }
            } else {
                // หากไม่พบผู้ใช้ด้วยอีเมลนี้
                // เพิ่มผู้ใช้ใหม่เข้าไปในฐานข้อมูล
                const user = {
                    email: req.user.email,
                    isAdmin: 0, // ตั้งค่าเริ่มต้น isAdmin เป็น 0 สำหรับ user ใหม่
                };
                
                // ดำเนินการเพิ่มผู้ใช้ใหม่
                pool.query('INSERT INTO user (email, isAdmin) VALUES (?, ?)', 
                    [user.email, user.isAdmin], 
                    (insertErr) => {
                        if (insertErr) {
                            console.error("Database insert error:", insertErr);
                            res.status(500).json({
                                error: true,
                                message: "Server error",
                            });
                        } else {
                            const token = jwt.sign(
                            { role: 'user' }, 
                            SECRET, 
                            { expiresIn: '2h' } 
                            );
                            res.status(200).json({ token });
                        }
                    }
                );
            }
        }
    });
});


router.get("/login/failed", (req, res) => {
	res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.redirect("https://krajorn.pamulamo.shop/");
});

// router.get("/google", passport.authenticate("google", ["profile", "email"]));

// router.get(
// 	"/google/callback",
// 	passport.authenticate("google", {
// 		successRedirect: "http://localhost:5173/butt",
// 		failureRedirect: "/login/failed",
// 	})
// );


router.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: "http://localhost:5173/landing",
        failureRedirect: "/api/auth/login/failed",
    }),
);


router.get("/logout", (req, res) => {
	req.logout();
	res.redirect('http://localhost:5173/');
});

module.exports = router;
