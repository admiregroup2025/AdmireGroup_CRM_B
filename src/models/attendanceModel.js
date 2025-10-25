import mongoose from "mongoose";

const { Schema } = mongoose;

const attendanceSchema = new Schema(
  {
    clockIn: { type: Date, required: true },
    clockOut: { type: Date },
    status: { type: String, enum: ["Present", "Late", "Half Day", "Absent"], default: "Absent" },
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    firstHalf: { type: String, enum: ["Present", "Absent"], default: "Absent" },
    secondHalf: { type: String, enum: ["Present", "Absent"], default: "Absent" },
    date: { type: Date, default: () => new Date().setHours(0, 0, 0, 0), required: true },
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance; // ✅ ES Module default export
