import express from "express";
import { AddEmployee, getAllEmployee, deleteEmployee } from "../controller/employeeController.js";

const router = express.Router();

// Add new employee
router.route("/addEmployee").post(AddEmployee);

// Get all employees
router.route("/allEmployee").get(getAllEmployee);

// Delete employee by ID
router.route("/deleteEmployee/:employeeId").delete(deleteEmployee);

export default router;
