
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// 1. EVENT SCHEMA
// ===============================

const departments = [
  "Computer Science",
  "Information Technology",
  "AI & Data Science",
  "Electronics & Telecommunication",
  "Mechanical",
  "Civil",
  "Electrical",
  "Other",
];

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    date: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    department: {
      type: String,
      required: true,
      enum: departments,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

// ===============================
// 2. REGISTRATION SCHEMA
// ===============================

const registrationSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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

// One email can register only once per event.
registrationSchema.index(
  { email: 1, eventId: 1 },
  { unique: true }
);

const Registration = mongoose.model(
  "Registration",
  registrationSchema
);

// ===============================
// 3. HOME / HEALTH ROUTE
// ===============================

app.get("/", (req, res) => {
  res.send("Campus Event Registration API is running!");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "API is running" });
});

// ===============================
// 4. GET ALL EVENTS
// ===============================

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error("Fetch events error:", error.message);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// ===============================
// 5. GET ONE EVENT
// ===============================

app.get("/api/events/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

// ===============================
// 6. CREATE EVENT
// ===============================

app.post("/api/events", async (req, res) => {
  try {
    const { title, description, date, venue, department } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof venue !== "string" ||
      !venue.trim() ||
      !date ||
      !department
    ) {
      return res.status(400).json({
        message: "Title, date, venue and department are required",
      });
    }

    const event = await Event.create({
      title: title.trim(),
      description:
        typeof description === "string" ? description.trim() : "",
      date,
      venue: venue.trim(),
      department,
    });

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Create event error:", error.message);
    res.status(400).json({
      message: "Could not create event. Check the input values.",
    });
  }
});

// ===============================
// 7. UPDATE EVENT
// ===============================

app.put("/api/events/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const allowedFields = [
      "title",
      "description",
      "date",
      "venue",
      "department",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Update event error:", error.message);
    res.status(400).json({ message: "Could not update event" });
  }
});

// ===============================
// 8. DELETE EVENT
// ===============================

app.delete("/api/events/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Remove registrations belonging to the deleted event.
    await Registration.deleteMany({ eventId: event._id });

    res.json({ message: "Event and its registrations deleted" });
  } catch (error) {
    console.error("Delete event error:", error.message);
    res.status(500).json({ message: "Could not delete event" });
  }
});

// ===============================
// 9. REGISTER A STUDENT
// ===============================

app.post("/api/registrations", async (req, res) => {
  try {
    const { studentName, email, eventId } = req.body;

    if (
      typeof studentName !== "string" ||
      !studentName.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      !eventId
    ) {
      return res.status(400).json({
        message: "Student name, email and event are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registration = await Registration.create({
      studentName: studentName.trim(),
      email: normalizedEmail,
      eventId,
    });

    res.status(201).json({
      message: "Registration successful!",
      registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered for this event",
      });
    }

    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Registration failed" });
  }
});

// ===============================
// 10. VIEW ALL REGISTRATIONS
// ===============================

app.get("/api/registrations", async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("eventId", "title department date venue")
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    console.error("Fetch registrations error:", error.message);
    res.status(500).json({
      message: "Could not fetch registrations",
    });
  }
});

// ===============================
// 11. VIEW REGISTRATIONS FOR ONE EVENT
// ===============================

app.get("/api/events/:id/registrations", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const registrations = await Registration.find({
      eventId: req.params.id,
    }).sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({
      message: "Could not fetch event registrations",
    });
  }
});

// ===============================
// 12. START SERVER
// ===============================

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/campus_events";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
