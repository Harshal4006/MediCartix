import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    form: {
      type: String,
      default: "Tablet",
    },

    packSize: {
      type: String,
      default: "10 tablets",
    },

    manufacturer: {
      type: String,
      default: "MediCartix Pharmaceuticals Ltd.",
    },

    countryOfOrigin: {
      type: String,
      default: "India",
    },

    prescriptionRequired: {
      type: Boolean,
      default: false,
    },

    expiryMonths: {
      type: Number,
      default: 36,
    },
  },
  { timestamps: true }
);


const medicineModel =
  mongoose.models.medicine ||
  mongoose.model("medicine", medicineSchema);

export default medicineModel;