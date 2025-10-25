import Attendance from "../models/attendanceModel.js";
import Employee from "../models/employeeModel.js";

// Helper: get start and end of today (UTC-safe)
const getTodayRange = () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { todayStart, todayEnd };
};

// Clock-In Function
export const clockIn = async (req, res) => {
  try {
    const { employeeId, companyId } = req.body;

    if (!employeeId || !companyId) {
      return res.status(400).json({ message: "Employee and Company are required" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Get today's start & end
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Check if attendance already exists for this employee + company today
    const existing = await Attendance.findOne({
      employee: employeeId,
      company: companyId,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (existing) {
      return res.status(400).json({
        message: "You have already clocked in today for this company.",
      });
    }

    const now = new Date();
    const shiftStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      10, 0, 0, 0 // 10:00 AM shift start
    );

    const diffMins = (now - shiftStart) / 1000 / 60;

    let status = "Present";
    let firstHalf = "Present";
    let secondHalf = "Present";

    if (diffMins > 15 && diffMins <= 180) {
      status = "Late";
      firstHalf = "Absent";
    } else if (diffMins > 180 && diffMins <= 300) {
      status = "Half Day";
      firstHalf = "Absent";
    } else if (diffMins > 300) {
      status = "Absent";
      firstHalf = "Absent";
      secondHalf = "Absent";
    }

    const attendance = new Attendance({
      employee: employeeId,
      company: companyId,
      clockIn: now,
      date: todayStart,
      status,
      firstHalf,
      secondHalf,
    });

    await attendance.save();

    res.status(201).json({ message: "Clock-in recorded successfully", attendance });
  } catch (err) {
    console.error("Error in clockIn:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Clock-Out Function
export const clockOut = async (req, res) => {
  try {
    const { employeeId, companyId } = req.body;

    if (!employeeId || !companyId) {
      return res.status(400).json({ message: "Employee and Company are required" });
    }

    const { todayStart, todayEnd } = getTodayRange();

    // Include company in query
    const attendance = await Attendance.findOne({
      employee: employeeId,
      company: companyId,
      date: { $gte: todayStart, $lte: todayEnd },
    }).sort({ clockIn: -1 });

    if (!attendance) {
      return res.status(404).json({ message: "No clock-in found for today" });
    }

    if (attendance.clockOut) {
      return res.status(400).json({ message: "Already clocked out today" });
    }

    const now = new Date();
    attendance.clockOut = now;

    const shiftMid = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0, 0, 0);
    if (attendance.firstHalf === "Absent" && now >= shiftMid) {
      attendance.secondHalf = "Present";
    }

    await attendance.save();

    return res.status(200).json({
      message: "Clock-out recorded successfully",
      attendance,
    });
  } catch (error) {
    console.error("Error in ClockOut:", error.stack);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get attendance for all employees (optionally restrict by company or role)
export const getAttendanceForAllEmployee = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find()
      .populate("employee", "fullName email") // Adjust per your schema fields
      .populate("company", "name");

    return res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
