const mysql = require("mysql")
const dotenv = require("dotenv")
dotenv.config()


const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

db.getConnection((err, connection) => {
    if (err) {
        console.error("Oops! an error occured while connecting to the database ❌:", err)
    } else {
        console.log("Connection to the database established successfully ✅")
        connection.release()
    }

})
module.exports = db