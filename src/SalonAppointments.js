import React, { useState, useEffect } from "react";
import "./styles.css";

const API_URL = "https://salon-backend-1i9q.onrender.com";

const SalonAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  // 🔹 1. Preia programările din MongoDB și le grupează pe zile
  useEffect(() => {
    fetch(`${API_URL}/appointments`)
      .then((res) => res.json())
      .then((data) => setAppointments(data))
      .catch((err) => console.error("❌ Eroare la preluarea programărilor:", err));
  }, []);

  // 🔹 2. Verifică dacă formularul este complet
  useEffect(() => {
    setIsFormComplete(name && date && time && service);
  }, [name, date, time, service]);

  // 🔹 3. Salvează programarea în MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();
    const appointment = { name, date, time, service };

    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment),
      });

      if (response.ok) {
        const newAppointment = await response.json();
        setAppointments([...appointments, newAppointment]);
        setName("");
        setDate("");
        setTime("");
        setService("");
        setConfirmationMessage("✅ Programarea a fost înregistrată cu succes!");
        setTimeout(() => setConfirmationMessage(""), 3000);
      }
    } catch (error) {
      console.error("❌ Eroare la salvarea programării:", error);
    }
  };

  // 🔹 4. Funcție pentru gruparea programărilor pe zile și sortarea după oră
  const groupedAppointments = appointments.reduce((acc, appt) => {
    if (!acc[appt.date]) {
      acc[appt.date] = [];
    }
    acc[appt.date].push(appt);
    return acc;
  }, {});

  // 🔹 5. Sortează programările după oră
  Object.keys(groupedAppointments).forEach(date => {
    groupedAppointments[date].sort((a, b) => a.time.localeCompare(b.time));
  });

  return (
    <div className="container">
      <h1>📅 Programări Salon</h1>
      <form onSubmit={handleSubmit} className="appointment-form">
        <input type="text" placeholder="Nume" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        <select value={service} onChange={(e) => setService(e.target.value)} required>
          <option value="">Alege un serviciu</option>
          <option value="Tuns">Tuns</option>
          <option value="Vopsit">Vopsit</option>
          <option value="Coafat">Coafat</option>
        </select>
        <button type="submit" style={{ backgroundColor: isFormComplete ? "blue" : "lightgray", color: isFormComplete ? "white" : "black" }} disabled={!isFormComplete}>Adaugă programare</button>
      </form>

      {confirmationMessage && <p className="confirmation-message">{confirmationMessage}</p>}

      <h2>Programări Confirmate</h2>
      <div className="filter-section">
        <label>Filtrare după dată: </label>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
      </div>
      <div className="appointments-container">
        <div className="appointments-box">
          {Object.keys(groupedAppointments).sort().map((date) => (
            (!filterDate || filterDate === date) && (
              <div key={date} className="appointment-day">
                <h3>📅 {new Date(date).toLocaleDateString("ro-RO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h3>
                <ul className="appointment-list">
                  {groupedAppointments[date].map((appt, index) => (
                    <li key={index}>
                      <strong>{appt.name}</strong> - {appt.time} ({appt.service})
                    </li>
                  ))}
                </ul>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalonAppointments;
