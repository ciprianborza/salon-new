import React, { useState, useEffect } from "react";
import "./styles.css";

const SalonAppointments = () => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [appointments, setAppointments] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    const keepBackendAlive = () => {
      fetch(`${API_URL}/keep-alive`).catch((err) =>
        console.error("❌ Eroare la păstrarea activă a backend-ului:", err)
      );
    };

    const interval = setInterval(keepBackendAlive, 300000);
    return () => clearInterval(interval);
  }, [API_URL]);

  useEffect(() => {
    fetch(`${API_URL}/appointments`)
      .then((res) => res.json())
      .then((data) => setAppointments(data))
      .catch((err) => console.error("❌ Eroare la preluarea programărilor:", err));
  }, [API_URL]);

  useEffect(() => {
    setIsFormComplete(name && date && time && service);
  }, [name, date, time, service]);

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

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAppointments(appointments.filter((appt) => appt._id !== id));
        setConfirmationMessage("❌ Programarea a fost ștearsă!");
        setTimeout(() => setConfirmationMessage(""), 3000);
      } else {
        console.error(`⚠️ Eroare la ștergerea programării cu ID ${id}: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Eroare la ștergerea programării:", error);
    }
  };

  const generateDateList = () => {
    const today = new Date();
    const dateList = [];
    for (let i = 0; i <= 90; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      const formattedDate = futureDate.toISOString().split("T")[0];
      dateList.push(formattedDate);
    }
    return dateList;
  };

  const groupedAppointments = generateDateList().reduce((acc, date) => {
    acc[date] = appointments.filter((appt) => appt.date === date);
    return acc;
  }, {});

  Object.keys(groupedAppointments).forEach((date) => {
    groupedAppointments[date].sort((a, b) => a.time.localeCompare(b.time));
  });

  return (
    <div className="container">
      <h1>📅 Programări Natalie Studio</h1>
      <form onSubmit={handleSubmit} className="appointment-form">
        <input type="text" placeholder="Nume" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        <select value={service} onChange={(e) => setService(e.target.value)} required>
          <option value="">Alege un serviciu</option>
          <option value="Tuns">Tuns</option>
          <option value="Vopsit">Vopsit</option>
          <option value="Tuns+Vopsit">Tuns+Vopsit</option>
          <option value="Aranjat">Aranjat</option>
          <option value="Baleiaj">Baleiaj</option>
          <option value="Decorolat">Decolorat</option>
          <option value="Suvite">Suvite</option>
          <option value="Intretinere">Intretinere</option>
        </select>
        <button
          type="submit"
          style={{
            backgroundColor: isFormComplete ? "blue" : "lightgray",
            color: isFormComplete ? "white" : "black",
          }}
          disabled={!isFormComplete}
        >
          Adaugă programare
        </button>
      </form>

      {confirmationMessage && <p className="confirmation-message">{confirmationMessage}</p>}

      <h2>Programări Confirmate</h2>
      <div className="filter-section">
        <label>Filtrare după dată: </label>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
      </div>
      <div className="appointments-container">
        <div className="appointments-box">
          {Object.keys(groupedAppointments)
            .sort()
            .map((date) =>
              (!filterDate || filterDate === date) && (
                <div key={date} className="appointment-day">
                  <h3>
                    📅{" "}
                    {new Date(date).toLocaleDateString("ro-RO", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  {groupedAppointments[date].length > 0 ? (
                    <ul className="appointment-list">
                      {groupedAppointments[date].map((appt, index) => (
                        <li key={index} className="confirmed-appointment">
                          <strong>{appt.name}</strong> - {appt.time} ({appt.service})
                          <button className="delete-btn" onClick={() => handleDelete(appt._id)}>🗑 Șterge</button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-appointments">Fara programari!</p>
                  )}
                </div>
              )
            )}
        </div>
      </div>
    </div>
  );
};

export default SalonAppointments;
