import express from "express"
import { addmedicine, listMedicine, removeMedicine, searchMedicine } from "../controllers/medicineController.js"
import multer from "multer"

const medicineRouter = express.Router();

// Image Storage Engine

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req,file,cb)=>{
        return cb(null,`${Date.now()}${file.originalname}`)
    }
})

const uploads = multer({storage:storage})

medicineRouter.post("/add", uploads.single("image"), addmedicine)
medicineRouter.get("/list", listMedicine);
medicineRouter.post("/remove", removeMedicine)
medicineRouter.get("/search", searchMedicine);



export default medicineRouter;