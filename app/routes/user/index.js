const express = require("express");
const router = express.Router();
const sports = require("./sports.routes");
const mini = require("./mini.routes");
const vr = require("./vr.routes");

router.use("/sports", sports);
router.use("/mini", mini);
router.use("/vr", vr);

module.exports = router;
