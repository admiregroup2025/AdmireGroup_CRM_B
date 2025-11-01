import { response } from "express";
import Attendance from "../models/attendanceModel.js";
import Employee from "../models/employeeModel.js";
import moment from "moment-timezone";

  
/* -------------------------------------------------------------------------- */
/* 🕒 UTILITIES */
/* -------------------------------------------------------------------------- */

// Get today's start and end time (UTC-safe)
const getTodayRange = () => {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  );
  const end = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  );
  return { start, end };
};

// Calculate difference in minutes
const diffInMinutes = (later, earlier) =>
  Math.floor((later - earlier) / (1000 * 60));

/* -------------------------------------------------------------------------- */
/* ✅ CLOCK-IN FUNCTION */
/* -------------------------------------------------------------------------- */
export const clockIn = async (req, res) => {
  try {
    const { employeeId, companyId } = req.body;
    if (!employeeId || !companyId)
      return res.status(400).json({ message: "Employee and company are required." });

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found." });

    const { start, end } = getTodayRange();

    // Check if already clocked in today
    const existingRecord = await Attendance.findOne({
      employee: employeeId,
      company: companyId,
      date: { $gte: start, $lte: end },
    });
    if (existingRecord)
      return res.status(400).json({ message: "Already clocked in for today." });

    // ✅ Always use IST-based time for logic
    const now = moment().tz("Asia/Kolkata").toDate();

    // Shift boundaries (IST)
    const shiftStart = moment.tz("10:00", "HH:mm", "Asia/Kolkata").toDate();
    const graceEnd = moment.tz("10:15", "HH:mm", "Asia/Kolkata").toDate();
    const lateEnd = moment.tz("12:00", "HH:mm", "Asia/Kolkata").toDate();
    const halfDayEnd = moment.tz("14:00", "HH:mm", "Asia/Kolkata").toDate();

    if (now > halfDayEnd) {
      return res.status(400).json({
        message: "Clock-in not allowed after 2:00 PM. Please contact admin.",
      });
    }

    let status = "Present";
    let firstHalf = "Present";
    let secondHalf = "Present";
    let remarks = "";
    let lateMinutes = 0;
    let isLate = false;

    // Attendance logic
    if (now < shiftStart) {
      status = "Present";
      remarks = "On time (Present)";
    } else if (now >= shiftStart && now <= graceEnd) {
      status = "Grace Present";
      remarks = "Within grace period (Present)";
    } else if (now > graceEnd && now <= lateEnd) {
      status = "Late";
      isLate = true;
      lateMinutes = diffInMinutes(now, shiftStart);
      remarks = `Late by ${lateMinutes} minutes (Still Present)`;
    } else if (now > lateEnd && now <= halfDayEnd) {
      status = "Half Day";
      firstHalf = "Absent";
      remarks = "Clocked in between 12:00–2:00 PM (Half Day)";
    }

    const attendance = new Attendance({
      employee: employeeId,
      company: companyId,
      clockIn: now,
      date: start,
      status,
      firstHalf,
      secondHalf,
      lateMinutes,
      isLate,
      remarks,
    });

    await attendance.save();
    return res.status(201).json({ message: "Clock-in recorded successfully", attendance });
  } catch (error) {
    console.error("❌ Error in clockIn:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


/* -------------------------------------------------------------------------- */
/* ✅ CLOCK-OUT FUNCTION */
/* -------------------------------------------------------------------------- */
export const clockOut = async (req, res) => {
  try {
    const { employeeId, companyId } = req.body;
    if (!employeeId || !companyId)
      return res.status(400).json({ message: "Employee and company are required." });

    const { start, end } = getTodayRange();
    const attendance = await Attendance.findOne({
      employee: employeeId,
      company: companyId,
      date: { $gte: start, $lte: end },
    });
    if (!attendance)
      return res.status(404).json({ message: "No clock-in record found for today." });
    if (attendance.clockOut)
      return res.status(400).json({ message: "Already clocked out today." });

    // ✅ IST-safe time
    const now = moment().tz("Asia/Kolkata").toDate();
    attendance.clockOut = now;

    const workedHours = ((now - attendance.clockIn) / (1000 * 60 * 60)).toFixed(2);
    attendance.workedHours = parseFloat(workedHours);

    const shiftMid = moment.tz("13:00", "HH:mm", "Asia/Kolkata").toDate();
    if (attendance.firstHalf === "Absent" && now >= shiftMid) {
      attendance.secondHalf = "Present";
    }

    const MIN_HOURS_FOR_HALF_DAY = 3;
    const MIN_HOURS_FOR_FULL_DAY = 7;

    if (attendance.workedHours < MIN_HOURS_FOR_HALF_DAY) {
      attendance.status = "Absent";
      attendance.firstHalf = "Absent";
      attendance.secondHalf = "Absent";
      attendance.remarks = `Worked ${attendance.workedHours} hrs — Absent`;
    } else if (attendance.workedHours < MIN_HOURS_FOR_FULL_DAY) {
      attendance.status = "Half Day";
      attendance.remarks = `Worked ${attendance.workedHours} hrs — Half Day`;
    } else {
      attendance.status = "Present";
      attendance.remarks = `Worked ${attendance.workedHours} hrs — Full Day`;
    }

    await attendance.save();
    return res.status(200).json({ message: "Clock-out recorded successfully", attendance });
  } catch (error) {
    console.error("❌ Error in clockOut:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


/* -------------------------------------------------------------------------- */
/* ✅ GET ALL ATTENDANCE RECORDS */
/* -------------------------------------------------------------------------- */
export const getAttendanceForAllEmployee = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find()
      .populate("employee", "fullName email role department")
      .populate("company", "name")
      .sort({ date: -1 });

    return res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("❌ Error fetching attendance records:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};



export const editAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const updates = req.body;

    // ❌ Don't re-wrap as new Date() — frontend already sent UTC ISO
    // ✅ Just store directly
    const attendance = await Attendance.findByIdAndUpdate(attendanceId, updates, {
      new: true,
      runValidators: true,
    });

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    return res.status(200).json({
      message: "Attendance record updated successfully",
      attendance,
    });
  } catch (error) {
    console.error("Error updating attendance record:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getAttendanceByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Find all attendance records for this employee
    const attendanceRecords = await Attendance.find({ employee: employeeId }).populate("employee");

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: "No attendance records found for this employee" });
    }

    return res.status(200).json({ message: "Attendance found", data: attendanceRecords });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};