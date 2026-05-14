'use client';
import { useState } from "react";

export default function FindFriends() {

  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Idle");

  async function handleFindFriends() {
    console.log("🚀 BUTTON CLICKED");
    setStatus("Button clicked");
    setLoading(true);

    try {

      // STEP 1
      console.log("STEP 1: Checking Contacts API");
      setStatus("Checking Contacts API...");

      if (!navigator.contacts || !navigator.contacts.select) {
        console.error("❌ Contacts API not supported");
        setStatus("Contacts API not supported");
        alert("This device/browser does not support Contacts API");
        return;
      }

      console.log("✅ Contacts API supported");
      setStatus("Contacts API supported");

      // STEP 2
      console.log("STEP 2: Opening contact picker...");
      setStatus("Opening contact picker...");

      const contacts = await navigator.contacts.select(
        ["name", "tel"],
        { multiple: true }
      );

      console.log("STEP 3: Contacts received", contacts);
      setStatus(`Got ${contacts.length} contacts`);

      // STEP 3
      const normalizedContacts = contacts.map((c, i) => {
        const data = {
          name: c.name?.[0] || "No Name",
          phone: (c.tel?.[0] || "").replace(/\s/g, "")
        };

        console.log(`📞 Contact ${i}:`, data);
        return data;
      });

      console.log("STEP 4: Normalized contacts", normalizedContacts);

      // STEP 5
      console.log("STEP 5: Sending to backend...");
      setStatus("Sending to backend...");

      const res = await fetch(
        "https://backend-k.vercel.app/post/number/sync-contacts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contacts: normalizedContacts
          })
        }
      );

      console.log("STEP 6: Response received", res);

      if (!res.ok) {
        throw new Error(`Backend error: ${res.status}`);
      }

      const data = await res.json();

      console.log("STEP 7: Backend JSON", data);

      setFriends(data.matchedUsers || []);
      setSuggestions(data.suggestions || []);

      setStatus("Sync complete ✅");

    } catch (err) {

      console.error("❌ ERROR:", err);
      setStatus("Error occurred ❌",err);

    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%", marginTop: 20 }}>

      <button onClick={handleFindFriends}>
        {loading ? "Syncing..." : "Find Friends"}
      </button>

      {/* LIVE STATUS (VERY IMPORTANT FOR MOBILE DEBUGGING) */}
      <p style={{ marginTop: 10, color: "blue" }}>
        Status: {status}
      </p>

      {/* FRIENDS */}
      <h3>Friends on App</h3>

      {friends.map((u, i) => (
        <div key={i}>
          <img src={u.profilePic} width="40" />
          <b>{u.name}</b>
          <p>{u.phone}</p>
        </div>
      ))}

      {/* SUGGESTIONS */}
      <h3>Suggested Usernames</h3>

      {suggestions.map((s, i) => (
        <div key={i}>
          <p>{s}</p>
        </div>
      ))}

    </div>
  );
}
