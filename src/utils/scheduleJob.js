// utils/scheduleJob.js
import schedule from "node-schedule";
import Employee from "../models/employeeModel.js";
import Attendance from "../models/attendanceModel.js";

const getTodayRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ✅ Schedule job to run daily at 2:05 PM (local server time)
const job = schedule.scheduleJob("1 14 * * *", async () => {
  console.log("⏰ Running daily auto-absent check (2:05 PM)...");

  const { start, end } = getTodayRange();
  const today = new Date(); // ✅ Define today's actual date

  try {
    const employees = await Employee.find();

    for (const emp of employees) {
      const existing = await Attendance.findOne({
        employee: emp._id,
        company: emp.company,
        date: { $gte: start, $lte: end },
      });

      // ✅ Only mark absent if no record exists for today
      if (!existing) {
        await Attendance.create({
          employee: emp._id,
          company: emp.company,
          date: today, // ✅ Fixed here (was undefined)
          clockIn: null,
          clockOut: null,
          status: "Absent",
          firstHalf: "Absent",
          secondHalf: "Absent",
          remarks: "Did not clock in before 2:00 PM — auto-marked absent",
        });

        console.log(`❌ Marked Absent: ${emp.fullName || emp._id}`);
      } else {
        console.log(`✅ ${emp.fullName || emp._id} already has attendance, skipping.`);
      }
    }

    console.log("✅ Auto-absent marking completed successfully!");
  } catch (err) {
    console.error("❌ Error running auto-absent job:", err.message);
  }
});

export default job;