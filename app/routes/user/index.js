const express = require("express");
const router = express.Router();
const sports = require("./sports.routes");
const mini = require("./mini.routes");

router.use("/sports", sports);
router.use("/mini", mini);

module.exports = router;
