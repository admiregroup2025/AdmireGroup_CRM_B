const Admin  = require("../models/Adminmodel")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { fName, lName, email, password } = req.body;
    if (!fName || !lName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const duplicate = await Admin.findOne({ email });
    if (duplicate) {
      return res.status(400).json({ error: "Email is already exists" });
    }
    const hashPass = await bcrypt.hash(password, 10);
    const adminObj = {
      fName,
      lName,
      email,
      password: hashPass,
    };
    const admin = new Admin(adminObj);
    await admin.save();
    if (admin) {
      return res.status(200).json({ message: "Admin Successfully Created" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};




const getUser = async(req,res)=>{
  try {
    const data = await Admin.find();
    if(!data){
      return res.status(404).json({msg:"not working"});
    }

    return res.status(200).json(data);
  } catch (error) {
    console.log(error)
    return res.status(500).json({message:"Server error "})
  }
}


const login = async(req,res)=>{
  try {
    const {email , password} = req.body;
    if(!email || !password){
      return res.status(400).json({message:"Enter email and password"})
    }
    const admin = await Admin.findOne({email})

    if(!email){
      return res.status(400).json({message:"Email or password is mismatched"})
    }
    const isMatch = await bcrypt.compare(password , admin.password)

    if(!isMatch){
      return res.status(400).json({message:"Email or password is wrong "})
    }
    const accessToken = jwt.sign( {
        id: admin._id,
      },
      process.env.JWT,
      {
        expiresIn: "15m",
      })
    //   const refreshToken = jwt.sign(
    //   {
    //     id: user._id,
    //   },
    //   process.env.REFRESH_JWT,
    //   {
    //     expiresIn: "1d",
    //   }
    // );
    // res.cookie("jwt", refreshToken, {
    //   httpOnly: true,
    //   sameSite: "None",
    //   secure: true,
    //   maxAge: 24 * 60 * 60 * 1000,
    // });
      return res.json({accessToken})
  } catch (error) {
    console.log(error)
    return res.status(500).json({message:"Server Error"})
  }
}

const refresh = async (req, res) => {
  try {
    const { cookies } = req.body;
    if (!cookies) {
      return res.status(400).json({ message: "Unauthorized" });
    }
    const refreshToken = cookies.jwt;
    if (!refreshToken) {
      return res.status(400).json({ message: "Unauthorized" });
    }
    jwt.verify(refreshToken, process.env.REFRESH_JWT, async (err, decoded) => {
      try {
        if (err) {
          return res.status(400).json({ message: "Unauthorized" });
        }
        const findUser = await User.findOne({ id: decoded.id });

        const accessToken = jwt.sign({ id: finddUser._id }, process.env.JWT, {
          expiresIn: "15m",
        });
        res.json(accessToken);
      } catch (error) {
        return res.status(500).json({ message: "Server error" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { register , getUser , login , refresh};