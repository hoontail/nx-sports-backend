const express = require("express");
const router = express.Router();
const sports = require("./sports.routes");

router.use("/sports", sports);

module.exports = router;
