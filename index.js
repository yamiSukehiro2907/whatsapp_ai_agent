const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", require("./routers/chat.route.js"));

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
