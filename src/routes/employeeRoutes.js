import express from "express";
import { AddEmployee, getAllEmployee, deleteEmployee, editEmployee } from "../controller/employeeController.js";
import { editAdmin } from "../controller/adminController.js";

const router = express.Router();

// Add new employee
router.route("/addEmployee").post(AddEmployee);

// Get all employees
router.route("/allEmployee").get(getAllEmployee);

// Delete employee by ID
router.route("/deleteEmployee/:employeeId").delete(deleteEmployee);

//edit employee by ID
router.route("/editEmployee/:employeeId").put(editEmployee);



export default router;
