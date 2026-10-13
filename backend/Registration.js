
const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent the same email registering twice for one event
registrationSchema.index(
  { email: 1, eventId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Registration", registrationSchema);
