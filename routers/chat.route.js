const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chat.controller.js");

router.post("/whatsapp-hook", chat);

module.exports = router;
