import mongoose from "mongoose";

const transitionSchema = new mongoose.Schema(
  {
    previousState: {
      type: String,
      enum: ["Unknown", "Healthy", "Down"],
      required: true
    },
    input: {
      type: String,
      enum: ["Success", "Failure"],
      required: true
    },
    nextState: {
      type: String,
      enum: ["Unknown", "Healthy", "Down"],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

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
  httpStatusCode: {
    type: Number,
    default: null
  },
  responseTime: {
    type: Number,
    default: 0
  },
  lastChecked: {
    type: Date,
    default: null
  },
  transitionHistory: {
    type: [transitionSchema],
    default: []
  }
});

export default mongoose.model("Health", healthSchema);