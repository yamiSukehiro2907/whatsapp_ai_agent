const Database = require("better-sqlite3");

const db = new Database("chat.db");

const userCreationQuery = `
CREATE TABLE IF NOT EXISTS Users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT NOT NULL UNIQUE,
  financial_profile TEXT,  /* <-- FIXED TYPO */
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.exec(userCreationQuery);

const messageCreationQuery = `
CREATE TABLE IF NOT EXISTS Messages (
   message_id INTEGER PRIMARY KEY AUTOINCREMENT,
   user_id INTEGER NOT NULL,
   sender_role TEXT NOT NULL CHECK(sender_role IN ('user' , 'ai')),
   content TEXT NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (user_id) REFERENCES Users (user_id)
);
`;
db.exec(messageCreationQuery);

const createIndexQuery = `CREATE INDEX IF NOT EXISTS idx_user_id ON Messages (user_id)`;
db.exec(createIndexQuery);

console.log("✅ Database and tables created successfully."); 
