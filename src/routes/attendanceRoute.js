import { clockIn, clockOut, getAttendanceForAllEmployee ,editAttendance  } from '../controller/attendanceController.js';


import express from "express";
const router = express.Router();

router.route("/clockin").post(clockIn);
router.route("/clockout").post(clockOut);
router.route("/getAllAttendance").get(getAttendanceForAllEmployee);
router.route("/:attendanceId").patch(editAttendance)

export default router;
