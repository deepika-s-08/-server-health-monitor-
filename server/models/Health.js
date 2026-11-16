
import mongoose from "mongoose";

const healthSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  url: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["Unknown", "Healthy", "Down"],
    default: "Unknown"
  },

  responseTime: {
    type: Number,
    default: 0
  },

  lastChecked: {
    type: Date,
    default: null
  }
});

export default mongoose.model("Health", healthSchema);
