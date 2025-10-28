import express from "express";
import { register, getUser, deleteAdmin, editAdmin , getAdmin } from "../controller/adminController.js";

const router = express.Router();

router.route("/addAdmin").post(register);
router.route("/getAdmin").get(getUser);

router.route("/deleteAdmin/:adminId").delete(deleteAdmin);
router.put("/editAdmin/:adminId", editAdmin);

router.route("/getAdmin/:adminId").get(getAdmin);


export default router;
