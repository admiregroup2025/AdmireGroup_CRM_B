import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company", // optional if you have multi-company setup
  },
  leaveType: {
    type: String,
    enum: ["Sick Leave", "Casual Leave", "Earned Leave", "Other"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  adminRemark: {
    type: String,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Leave", LeaveSchema);