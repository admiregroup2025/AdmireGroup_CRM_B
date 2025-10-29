import Admin from "../models/Adminmodel.js"; // Include .js extension
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Leave from "../models/LeaveModel.js";



export const register = async (req, res) => {
  try {
    const { fullName, email, password,phone, role, accountActive ,department , company } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !role||!phone||!department||!company) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const duplicate = await Admin.findOne({ email });
    if (duplicate) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashPass = await bcrypt.hash(password, 10);

    // Create admin object
    const adminObj = {
      fullName,
      email,
      password: hashPass,
      role,
      department,
      phone,
      company,
      accountActive: accountActive !== undefined ? accountActive : true,
    };

    const admin = new Admin(adminObj);
    await admin.save();

    return res.status(201).json({ message: "Admin successfully created", admin });
  } catch (error) {
    console.error("Error creating admin:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};



export const getUser = async(req,res)=>{
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


export const refresh = async (req, res) => {
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

        const accessToken = jwt.sign({ id: findUser._id }, process.env.JWT, {
          expiresIn: "12h",
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


export const getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employeeId", "fullName email")
      .sort({ appliedAt: -1 });

    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leave requests", error: err.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, adminRemark } = req.body;
    
    if (!["Approved", "Rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      { status, adminRemark },
      { new: true }
    );

    if (!leave) return res.status(404).json({ message: "Leave not found" });

    res.status(200).json({ message: `Leave ${status.toLowerCase()} successfully`, leave });
  } catch (err) {
    res.status(500).json({ message: "Error updating leave", error: err.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params; 


    const admin = await Admin.findByIdAndDelete(adminId);

    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    return res.status(200).json({ msg: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};



export const editAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const updateData = req.body;

    const admin = await Admin.findByIdAndUpdate(adminId, updateData, {
      new: true, // return updated document
      runValidators: true, // ensures validation rules in schema are applied
    });

    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    return res.status(200).json({
      msg: "Admin updated successfully",
      admin,
    });
  } catch (error) {
  }
};


export const getAdmin  = async (req, res) => {
  try {
    const { adminId } = req.params;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }
    return res.status(200).json({
      msg: "Admin fetched successfully",
      admin,
    });
  } catch (error) {
    console.error("Error fetching admin:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};  
