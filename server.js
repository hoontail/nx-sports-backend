const express = require("express");
const http = require("http");
const db = require("./app/models");
const device = require("express-device");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./app/routes/user");
const adminRoutes = require("./app/routes/admin");
const sportsDataSchedule = require("./app/schedule/sportsData");

const app = express();
const server = http.createServer(app);

var corsOptions = {
  origin: "*",
};

// Device Detect
app.use(device.capture());

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

db.sequelize.sync();

app.use("/v1", userRoutes);
app.use("/a1", adminRoutes);

if (process.env.INSTANCE_ID == 0) {
  sportsDataSchedule.getPrematchData(true);
  sportsDataSchedule.getSpecialData();
  sportsDataSchedule.getInplayData();
}

const PORT = process.env.PORT || 10010;

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `\x1b[40m`,
    `\x1b[32m`,
    `                              
   _____  _____  _____  _____  _____ 
  |   __||_   _||  _  || __  ||_   _|
  |__   |  | |  |     ||    -|  | |  
  |_____|  |_|  |__|__||__|__|  |_|  
                                     
    [+] Server         : http://localhost:${PORT}
    [~] Running Server...
`,
    `\x1b[0m`
  );
  if (process.send) {
    // PM2에게 앱 구동이 완료되었음을 전달한다
    process.send("ready");
  }
});
