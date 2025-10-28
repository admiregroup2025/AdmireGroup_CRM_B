// const Employee = require("../models/employeeModel");
import bcrypt from "bcrypt";
import Employee from "../models/employeeModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Leave from "../models/LeaveModel.js";

export const AddEmployee = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      department,
      company,
      role,
    } = req.body;

    // Set default values for optional fields
    const accountActive = req.body.accountActive !== undefined ? req.body.accountActive : true;

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !department ||
      !password
    ) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Validate company ID format
    if (!mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid company ID format" 
      });
    }

    // Check if user already exists
    const existingUser = await Employee.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email or phone number",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new employee
    const newUser = new Employee({
      fullName,
      email,
      phone,
      department,
      company,
      password: hashedPassword,
      accountActive,
      role: role || "Employee",
    });

    await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      user: {
        fullName,
        email,
        phone,
        company,
        department,
        accountActive: newUser.accountActive,
      },
    });
  } catch (error) {
    console.error("Error in AddEmployee:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getAllEmployee = async (req, res) => {
  try {
    const employees = await Employee.find(); // Populate company name
    return res.status(200).json({
      message: "Employees fetched successfully",
      employees,
    });
  } catch (error) {
    console.error("Error in getAllEmployee:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params; // ✅ match route param name

    const deletedEmployee = await Employee.findByIdAndDelete(employeeId);

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Employee deleted successfully",
      deletedEmployee,
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const editEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updateData = req.body;

    const employee = await Employee.findByIdAndUpdate(employeeId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    return res.status(200).json({ msg: "Employee updated successfully", employee });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const { empId } = req.params;

    // Validate empId format
    if (!empId) {
      return res.status(400).json({ msg: "Employee ID is required" });
    }

    // Find employee by ID
    const employee = await Employee.findById(empId);

    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    return res.status(200).json({
      msg: "Employee fetched successfully",
      employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};


export const applyLeave = async (req, res) => {
  try {
    const { employeeId, companyId, leaveType, startDate, endDate, reason } = req.body;

    if (!employeeId || !leaveType || !startDate || !endDate || !reason)
      return res.status(400).json({ message: "All fields are required" });

    const leave = new Leave({
      employeeId,
      companyId,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    await leave.save();
    res.status(201).json({ message: "Leave applied successfully", leave });
  } catch (err) {
    res.status(500).json({ message: "Error applying leave", error: err.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const leaves = await Leave.find({ employeeId }).sort({ appliedAt: -1 });
    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaves", error: err.message });
  }
};