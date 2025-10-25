// const Employee = require("../models/employeeModel");
import Employee from '../models/employeeModel.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
export const AddEmployee = async (req, res) => {
  try {
    const { fullName, email, phone, password, department, company, account_active,role } = req.body;

    if (!fullName || !email || !company || !phone || !department || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await Employee.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(409).json({
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
      accountActive: account_active ?? true,
      role
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
    return res.status(500).json({ message: "Server error", error: error.message });
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
    return res.status(500).json({ message: "Server error", error: error.message });
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
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

