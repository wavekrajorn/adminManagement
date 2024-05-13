const express = require('express');
const passport = require('passport');
const authRoute = require("./auth");
const cookieSession = require("cookie-session");
const passportStrategy = require("./config/passport");

const getAdmin = require('./getAdmin');
const deleteAdmin = require('./deleteAdmin');
const editAdmin = require('./editAdmin');
const addAdmin = require('./addAdmin');







require('./auth');
require('dotenv').config();

const app = express();



app.use(
	cookieSession({
		name: "session",
		keys: ["cyberwolve"],
		maxAge: 24 * 60 * 60 * 100,
	})
);



app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:5173']; // เพิ่มต้นทางที่อนุญาต

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin); // กำหนดค่าเฉพาะเจาะจงที่อนุญาต
    }

    // อนุญาต HTTP methods ที่คุณต้องการ (GET, POST, PUT, DELETE, OPTIONS)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    // อนุญาต headers ที่จะถูกส่งจากต้นทาง
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // อนุญาตการส่งคุกกี้
    res.header('Access-Control-Allow-Credentials', 'true');

    // หากเป็น preflight request ให้ส่งสถานะ 200
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    // ดำเนินการต่อไป
    next();
});




// เส้นทางอื่น ๆ
app.use("/api/auth", authRoute);
app.use("/api/getAdmin", getAdmin);
app.use("/api/deleteAdmin", deleteAdmin);
app.use("/api/editAdmin", editAdmin);
app.use("/api/addAdmin", addAdmin);








const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
