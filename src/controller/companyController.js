import Company from "../models/CompanyModel.js"

export const createCompany = async(req,res)=>{
    try {
        const {companyName , phoneNumber , address , email , industry ,website , status , numberOfEmployees} = req.body;
        if(!companyName || !phoneNumber || !address || !email || !industry || !website || !status || !numberOfEmployees){
            return res.status(400).json({message:"All fields are required"})
        }
        const duplicate = await Company.findOne({companyName});
        if(duplicate){
            return res.status(400).json({message:"Company already exists"})
        }
        const companyObj = {
            companyName,
            phoneNumber,    
            address,
            email,
            industry,
            website,
            status,
            numberOfEmployees
        };
        const company = new Company(companyObj);
        await company.save(); 
        return res.status(200).json({message:"Company created successfully",company})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Server Error"})
    }
}

export const getAllCompanies = async(req ,res )=>{
    try {
        const companies = await Company.find({})
        if(!companies?.length){
            return res.status(404).json({message:"No companies found"})
        }
        return res.status(200).json({companies})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Server error"})
        }
}


export const getCompanyById = async(req,res)=>{
    try {
        const {id }= req.params;
        const company = await Company.findById(id);
        if(!company){
            return res.status(404).json({message:"Company not found"})
        }
        return res.status(200).json({company})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Server Error"}) 
       }
}


export const updateCompany = async(req,res)=>{
    try {
        const {id} = req.params;
        const company = await Company.findByIdAndUpdate(id)
        const {companyName , phoneNumber , address , email , industry ,website , status , numberOfEmployees} = req.body;
        if(!company){
            return res.status(404).json({message:"Company not found"})
        }
        const duplicate = await Company.findOne({companyName});
        if(duplicate){
            return res.status(400).json({message:"Company name already exists"})
        }
        (company.companyName = companyName),
        (company.phoneNumber = phoneNumber),    
        (company.address = address),
        (company.email = email),
        (company.industry = industry),
        (company.website = website),
        (company.status = status),
        (company.numberOfEmployees = numberOfEmployees)

        await company.save();
        return res.status(200).json({message:"Company updated successfully",company})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Server error"})
    }
}