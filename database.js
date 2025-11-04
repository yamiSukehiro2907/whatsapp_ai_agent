const Database = require("better-sqlite3");
const db = new Database("chat.db");
module.exports = db