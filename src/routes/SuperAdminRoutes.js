import express from "express";
import { addSuperAdmin } from "../controller/superAdminController.js";

const router = express.Router();

router.post("/", addSuperAdmin);

export default router;
