const  express = require("express")
const router = express.Router()
const {register, getUser, login} = require("../controller/adminController.js")


router.route("/").post(register)
router.route("/admin").get(getUser)
router.route("/login").post(login)

module.exports = router