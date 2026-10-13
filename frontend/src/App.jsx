
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api";

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

const emptyForm = {
  title: "",
  description: "",
  date: "",
  venue: "",
  department: "Computer Science",
};

function toLocalDateTime(value) {
  const date = value ? new Date(value) : new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function formatDate(value, options = {}) {
  if (!value) return "Date to be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date to be announced";
  return date.toLocaleDateString("en-IN", options);
}

function formatTime(value) {
  if (!value) return "Time TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time TBA";

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDateParts(value) {
  if (!value) return { day: "--", month: "TBA" };
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { day: "--", month: "TBA" };
  }

  return {
    day: date.toLocaleDateString("en-IN", { day: "2-digit" }),
    month: date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
  };
}

function App() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [student, setStudent] = useState({
    studentName: "",
    email: "",
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registering, setRegistering] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeDepartment, setActiveDepartment] =
    useState("All Departments");

  const [menuOpen, setMenuOpen] = useState(false);

  const [showMyRegistrations, setShowMyRegistrations] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);

  function notify(text, type = "success") {
    setMessage(text);
    setMessageType(type);

    window.setTimeout(() => {
      document.getElementById("app-message")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }

  async function loadEvents() {
    try {
      const response = await axios.get(`${API}/events`);
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      notify(
        "Cannot connect to the backend. Check that your server is running on port 5000.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function createEvent() {
    setEditingEvent(null);
    setForm({ ...emptyForm });
    setMenuOpen(false);

    document.getElementById("create-event")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function editEvent(event) {
    setEditingEvent(event);

    setForm({
      title: event.title || "",
      description: event.description || "",
      date: toLocalDateTime(event.date),
      venue: event.venue || "",
      department: event.department || "Computer Science",
    });

    document.getElementById("create-event")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  async function saveEvent(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        ...form,
        date: new Date(form.date).toISOString(),
      };

      if (editingEvent) {
        await axios.put(
          `${API}/events/${editingEvent._id}`,
          payload
        );
      } else {
        await axios.post(`${API}/events`, payload);
      }

      const successText = editingEvent
        ? "Event updated successfully!"
        : "Event published successfully!";

      setForm({ ...emptyForm });
      setEditingEvent(null);

      await loadEvents();
      notify(successText);

      document.getElementById("events")?.scrollIntoView({
        behavior: "smooth",
      });
    } catch (error) {
      notify(
        error.response?.data?.message || "Unable to save this event.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(id) {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await axios.delete(`${API}/events/${id}`);
      await loadEvents();
      notify("Event deleted successfully!");
    } catch (error) {
      notify(
        error.response?.data?.message || "Unable to delete this event.",
        "error"
      );
    }
  }

  async function registerStudent(e) {
    e.preventDefault();
    if (!selectedEvent) return;

    setRegistering(true);

    try {
      const registeredEventTitle = selectedEvent.title;

      await axios.post(`${API}/registrations`, {
        studentName: student.studentName.trim(),
        email: student.email.trim(),
        eventId: selectedEvent._id,
      });

      const email = student.email.trim();

      setSelectedEvent(null);
      setStudent({ studentName: "", email: "" });

      setRegistrationEmail(email);

      try {
        window.localStorage.setItem("eventhub-registration-email", email);
      } catch {
        // Registration is already saved by the backend.
      }

      notify(`Registration successful for "${registeredEventTitle}"!`);
    } catch (error) {
      notify(
        error.response?.data?.message ||
          "Registration failed. You may already be registered.",
        "error"
      );
    } finally {
      setRegistering(false);
    }
  }

  async function openMyRegistrations() {
    setShowMyRegistrations(true);
    setMenuOpen(false);
    setRegistrationsLoading(true);
    setMyRegistrations([]);

    let email = registrationEmail;

    if (!email) {
      try {
        email = window.localStorage.getItem("eventhub-registration-email") || "";
      } catch {
        email = "";
      }
    }

    setRegistrationEmail(email);

    try {
      const response = await axios.get(`${API}/registrations`);
      const allRegistrations = Array.isArray(response.data)
        ? response.data
        : [];

      const matching = email
        ? allRegistrations.filter(
            (registration) =>
              registration.email?.toLowerCase() === email.toLowerCase()
          )
        : [];

      setMyRegistrations(matching);
    } catch (error) {
      notify(
        error.response?.data?.message ||
          "Unable to load registrations. Check your backend.",
        "error"
      );
    } finally {
      setRegistrationsLoading(false);
    }
  }

  async function searchMyRegistrations(e) {
    e.preventDefault();
    setRegistrationsLoading(true);

    try {
      const response = await axios.get(`${API}/registrations`);
      const allRegistrations = Array.isArray(response.data)
        ? response.data
        : [];

      const email = registrationEmail.trim().toLowerCase();

      const matching = email
        ? allRegistrations.filter(
            (registration) =>
              registration.email?.toLowerCase() === email
          )
        : [];

      setMyRegistrations(matching);
    } catch (error) {
      notify(
        error.response?.data?.message ||
          "Unable to load registrations.",
        "error"
      );
    } finally {
      setRegistrationsLoading(false);
    }
  }

  function searchEvents(e) {
    e.preventDefault();
    setSearch(searchInput.trim());
  }

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const content = [
          event.title,
          event.description,
          event.venue,
          event.department,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch = content.includes(search.toLowerCase());

        const matchesDepartment =
          activeDepartment === "All Departments" ||
          event.department === activeDepartment;

        return matchesSearch && matchesDepartment;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, search, activeDepartment]);

  const upcomingEvents = filteredEvents.filter(
    (event) => new Date(event.date) >= new Date()
  );

  const displayedEvents = upcomingEvents.length
    ? upcomingEvents
    : filteredEvents;

  function getRegistrationEvent(registration) {
    const registeredEvent = registration.eventId;

    if (registeredEvent && typeof registeredEvent === "object") {
      return registeredEvent;
    }

    return events.find(
      (event) => event._id === registeredEvent
    );
  }

  return (
    <div className="app" id="home">
      <header className="navbar">
        <a className="brand" href="#home" aria-label="EventHub home">
          <span className="brand-mark">E</span>
          <span className="brand-name">EventHub</span>
        </a>

        <button
          className="mobile-menu-button"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <a
            className="nav-link active"
            href="#home"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </a>

          <a
            className="nav-link"
            href="#events"
            onClick={() => setMenuOpen(false)}
          >
            Events
          </a>

          <button
            className="nav-link"
            type="button"
            onClick={openMyRegistrations}
          >
            My Registrations
          </button>

          <button
            className="nav-create"
            type="button"
            onClick={createEvent}
          >
            Create Event <span>↗</span>
          </button>
        </nav>

        <a
          className="profile-button"
          href="#create-event"
          aria-label="Go to event management"
        >
          E
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-background">
            <span className="hero-rit">RIT</span>
            <span className="hero-image-note">
              YOUR RIT CAMPUS IMAGE GOES HERE
            </span>
          </div>

          <div className="hero-overlay" />

          <div className="hero-content">
            <span className="eyebrow hero-eyebrow">
              <span className="eyebrow-line" />
              YOUR CAMPUS. YOUR EVENTS.
            </span>

            <h1>
              Every event.
              <br />
              One <em>hub.</em>
            </h1>

            <p>
              Discover workshops, hackathons, seminars and cultural
              experiences happening at RIT. Find your next opportunity
              and reserve your spot.
            </p>

            <a className="primary-button" href="#events">
              Explore Events <span>→</span>
            </a>
          </div>

          <div className="hero-bottom">
            <span>RIT · ISLAMPUR</span>
            <span>PLAN. PUBLISH. PARTICIPATE.</span>
          </div>
        </section>

        {message && (
          <div
            id="app-message"
            className={`message ${messageType}`}
            role="status"
            aria-live="polite"
          >
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        )}

        <section className="events-section section-wrap" id="events">
          <form className="search-panel" onSubmit={searchEvents}>
            <label className="search-input">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search events by title, description or keyword..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search events"
              />
            </label>

            <select
              className="department-select"
              value={activeDepartment}
              onChange={(e) => setActiveDepartment(e.target.value)}
              aria-label="Filter by department"
            >
              <option>All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <button className="search-button" type="submit">
              Search →
            </button>
          </form>

          <div className="section-heading">
            <div>
              <span className="eyebrow">UPCOMING AT RIT</span>
              <h2>
                Featured <em>Events</em>
              </h2>
            </div>

            <span className="event-count">
              {displayedEvents.length} EVENTS
            </span>
          </div>

          {loading ? (
            <div className="empty-state">
              <span className="loading-dot" />
              <p>Loading events...</p>
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="empty-state">
              <span className="empty-symbol">✳</span>
              <h3>
                {search || activeDepartment !== "All Departments"
                  ? "No matching events"
                  : "Your next event starts here."}
              </h3>
              <p>
                {search || activeDepartment !== "All Departments"
                  ? "Try another search or department."
                  : "Be the first to publish a campus event."}
              </p>
              <button
                className="outline-button"
                type="button"
                onClick={createEvent}
              >
                Create an event ↗
              </button>
            </div>
          ) : (
            <div className="event-grid">
              {displayedEvents.map((event, index) => {
                const date = getDateParts(event.date);

                return (
                  <article
                    className="event-card"
                    key={event._id}
                    style={{ "--card-index": index }}
                  >
                    <div className="event-image">
                      <div className="image-placeholder">
                        <span className="placeholder-plus">+</span>
                        <span>RIT EVENT PHOTO</span>
                      </div>

                      <div className="date-badge">
                        <strong>{date.day}</strong>
                        <span>{date.month}</span>
                      </div>
                    </div>

                    <div className="event-card-body">
                      <span className="department-tag">
                        {event.department || "Campus Event"}
                      </span>

                      <h3>{event.title}</h3>

                      <p className="event-description">
                        {event.description ||
                          "Join us to learn, connect and create memorable campus experiences."}
                      </p>

                      <div className="event-details">
                        <p>
                          <span>◷</span> {formatTime(event.date)} ·{" "}
                          {formatDate(event.date, {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                        <p>
                          <span>⌖</span>{" "}
                          {event.venue || "Venue to be announced"}
                        </p>
                      </div>

                      <div className="card-actions">
                        <button
                          className="register-button"
                          type="button"
                          onClick={() => {
                            setSelectedEvent(event);
                            setStudent({ studentName: "", email: "" });
                          }}
                        >
                          Register <span>↗</span>
                        </button>

                        <button
                          className="icon-button"
                          type="button"
                          onClick={() => editEvent(event)}
                          aria-label={`Edit ${event.title}`}
                          title="Edit event"
                        >
                          ✎
                        </button>

                        <button
                          className="icon-button delete-button"
                          type="button"
                          onClick={() => deleteEvent(event._id)}
                          aria-label={`Delete ${event.title}`}
                          title="Delete event"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <p className="results-note">
            Showing {displayedEvents.length}{" "}
            {displayedEvents.length === 1 ? "event" : "events"} ·
            Connected to your campus event database
          </p>
        </section>

        <section className="statement-band">
          <div className="statement-inner">
            <div>
              <span className="eyebrow light-eyebrow">
                BE A PART OF IT
              </span>
              <h2>
                Great experiences
                <br />
                <em>happen here.</em>
              </h2>
            </div>

            <div className="statement-copy">
              <p>
                From technical workshops to cultural celebrations,
                there is always a reason to come together at RIT.
              </p>
              <a className="light-button" href="#events">
                Browse All Events <span>→</span>
              </a>
            </div>
          </div>
        </section>

        <section
          className="create-section section-wrap"
          id="create-event"
        >
          <div className="section-heading create-heading">
            <div>
              <span className="eyebrow">EVENT MANAGEMENT</span>
              <h2>
                {editingEvent
                  ? "Edit your event."
                  : "Bring an idea to life."}
              </h2>
              <p className="section-description">
                Publish and manage events for your campus community.
              </p>
            </div>
            <span className="section-number">01 / CREATE</span>
          </div>

          <form className="event-form" onSubmit={saveEvent}>
            <div className="form-grid">
              <label>
                Event title *
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g. AI Innovation Workshop"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Department *
                <select
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                  required
                >
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Venue *
                <input
                  value={form.venue}
                  onChange={(e) =>
                    setForm({ ...form, venue: e.target.value })
                  }
                  placeholder="e.g. Main Auditorium"
                  maxLength={150}
                  required
                />
              </label>

              <label>
                Date and time *
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                  min={toLocalDateTime()}
                  required
                />
              </label>

              <label className="full-width">
                Event description
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Tell students what this event is about..."
                  maxLength={1000}
                />
              </label>
            </div>

            <div className="form-footer">
              <p>* Required fields</p>
              <div className="form-actions">
                {editingEvent && (
                  <button
                    className="cancel-button"
                    type="button"
                    onClick={() => {
                      setEditingEvent(null);
                      setForm({ ...emptyForm });
                    }}
                  >
                    Cancel
                  </button>
                )}

                <button className="form-submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingEvent
                    ? "Save Changes ↗"
                    : "Publish Event ↗"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-main">
          <a className="brand" href="#home">
            <span className="brand-mark">E</span>
            <span className="brand-name">EventHub</span>
          </a>
          <p>Plan. Publish. Participate.</p>
          <a className="back-top" href="#home">
            Back to top ↑
          </a>
        </div>

        <div className="footer-bottom">
          <span>RIT · ISLAMPUR</span>
          <span>COLLEGE EVENT MANAGEMENT</span>
          <span>© {new Date().getFullYear()} EventHub</span>
        </div>
      </footer>

      {selectedEvent && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !registering) {
              setSelectedEvent(null);
            }
          }}
        >
          <section
            className="registration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-title"
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => !registering && setSelectedEvent(null)}
              aria-label="Close registration form"
            >
              ×
            </button>

            <span className="eyebrow">SAVE YOUR SPOT</span>
            <h2 id="registration-title">Register for an event</h2>
            <p className="modal-event-name">{selectedEvent.title}</p>

            <div className="modal-event-info">
              <span>
                ◷{" "}
                {formatDate(selectedEvent.date, {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                })}{" "}
                · {formatTime(selectedEvent.date)}
              </span>
              <span>⌖ {selectedEvent.venue}</span>
            </div>

            <form className="modal-form" onSubmit={registerStudent}>
              <label>
                Student name *
                <input
                  value={student.studentName}
                  onChange={(e) =>
                    setStudent({
                      ...student,
                      studentName: e.target.value,
                    })
                  }
                  placeholder="Your full name"
                  required
                />
              </label>

              <label>
                College email *
                <input
                  type="email"
                  value={student.email}
                  onChange={(e) =>
                    setStudent({ ...student, email: e.target.value })
                  }
                  placeholder="you@ritindia.edu"
                  required
                />
              </label>

              <button
                className="submit-registration"
                type="submit"
                disabled={registering}
              >
                {registering ? "Registering..." : "Confirm Registration ↗"}
              </button>
            </form>
          </section>
        </div>
      )}

      {showMyRegistrations && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowMyRegistrations(false);
            }
          }}
        >
          <section
            className="registration-modal my-registration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="my-registrations-title"
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setShowMyRegistrations(false)}
              aria-label="Close my registrations"
            >
              ×
            </button>

            <span className="eyebrow">YOUR EVENT LIST</span>
            <h2 id="my-registrations-title">My Registrations</h2>
            <p className="section-description">
              Enter the email address you used when registering.
            </p>

            <form className="modal-form" onSubmit={searchMyRegistrations}>
              <label>
                College email
                <input
                  type="email"
                  value={registrationEmail}
                  onChange={(e) => setRegistrationEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
              </label>
              <button
                className="submit-registration"
                type="submit"
                disabled={registrationsLoading}
              >
                {registrationsLoading ? "Loading..." : "Find My Registrations"}
              </button>
            </form>

            {registrationsLoading ? (
              <p>Loading your registrations...</p>
            ) : registrationEmail.trim() && myRegistrations.length === 0 ? (
              <p>No registrations found for this email.</p>
            ) : (
              <div className="my-registration-results">
                {myRegistrations.map((registration) => {
                  const event = getRegistrationEvent(registration);

                  return (
                    <article
                      className="my-registration-card"
                      key={registration._id}
                    >
                      <h3>
                        {event?.title || "Registered campus event"}
                      </h3>
                      {event && (
                        <p>
                          {formatDate(event.date, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          · {formatTime(event.date)}
                        </p>
                      )}
                      {event?.venue && <p>Venue: {event.venue}</p>}
                      <p>
                        Registered as: {registration.studentName}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
