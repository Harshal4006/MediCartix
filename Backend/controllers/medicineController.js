import { error } from "console";
import medicineModel from "../models/MedicineModel.js";
import fs from 'fs';


// Add Medicine Item

const addmedicine = async (req, res) => {
    
    let image_filename = `${req.file.filename}`;

    const medicine = new medicineModel({
        name:req.body.name,
        description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        image:image_filename
    })
    try{
        await medicine.save();
        res.json({success:true,message:"Medicine Added"})
    }catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})
    }
    
}

// All Medicine List
const listMedicine = async (req,res) => {
    try{
        const medicines = await medicineModel.find({});
        res.json({success:true,data:medicines})
    }catch (error){
        console.log(error)
        res.json({success:false,message:"Error"})
    }
}

// Remove Medicine Item
const removeMedicine = async (req, res) => {
  try {
    const medicine = await medicineModel.findById(req.body.id);

    // Check Medicine Exists
    if (!medicine) {
      return res.json({
        success: false,
        message: "Medicine not found",
      });
    }

    // Delete Image
    fs.unlink(`uploads/${medicine.image}`, (err) => {
      if (err) console.log(err);
    });

    // Delete From DB
    await medicineModel.findByIdAndDelete(req.body.id);

    res.json({
      success: true,
      message: "Medicine Removed",
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error removing medicine",
    });
  }
};

// Search Medicines
const searchMedicine = async (req, res) => {
  try {
    const query = req.query.q;

    const medicines = await medicineModel.find({
      name: { $regex: query, $options: "i" } // case insensitive search
    });

    res.json({ success: true, data: medicines });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Search failed" });
  }
};

export {addmedicine, listMedicine, removeMedicine, searchMedicine}