import { useState } from "react";

export default function FindFriends() {

  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleFindFriends() {
    try {
      setLoading(true);

      if (!("contacts" in navigator)) {
        alert("Contact Picker not supported");
        return;
      }

      const contacts = await navigator.contacts.select(
        ["name", "tel"],
        { multiple: true }
      );

      const normalizedContacts = contacts.map(c => ({
        name: c.name?.[0] || "",
        phone: (c.tel?.[0] || "").replace(/\s/g, "")
      }));

      // extract phones
      const phones = normalizedContacts.map(c => c.phone);

      const res = await fetch("http://localhost:5000/api/sync-contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contacts: normalizedContacts
        })
      });

      const data = await res.json();

      setFriends(data.matchedUsers || []);
      setSuggestions(data.suggestions || []);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%", marginTop: 20 }}>

      <button onClick={handleFindFriends}>
        {loading ? "Syncing..." : "Find Friends"}
      </button>

      {/* ================= FRIENDS ================= */}
      <h3>Friends on App</h3>

      {friends.map(u => (
        <div key={u.phone}>
          <img src={u.profilePic} width="40" />
          <b>{u.name}</b>
          <p>{u.phone}</p>
        </div>
      ))}

      {/* ================= SUGGESTIONS ================= */}
      <h3>Suggested Usernames</h3>

      {suggestions.map((s, i) => (
        <div key={i}>
          <p>{s}</p>
        </div>
      ))}

    </div>
  );
}
