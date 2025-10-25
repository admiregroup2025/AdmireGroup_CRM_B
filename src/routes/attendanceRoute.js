import { clockIn, clockOut, getAttendanceForAllEmployee } from '../controller/attendanceController.js';


import express from "express";
const router = express.Router();

router.route("/clockin").post(clockIn);
router.route("/clockout").post(clockOut);
router.route("/getAllAttendance").get(getAttendanceForAllEmployee);


export default router;
