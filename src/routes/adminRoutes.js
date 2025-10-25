import express from "express";
import { register, getUser } from "../controller/adminController.js";

const router = express.Router();

router.route("/addAdmin").post(register);
router.route("/getAdmin").get(getUser);
// router.route("/login").post(login);

export default router;
