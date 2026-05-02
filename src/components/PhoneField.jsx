import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

function PhoneField({ onChangeFinal }) {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("in"); // fallback

  // 🔹 Step 1: Auto detect country via IP
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data.country_code) {
          setCountryCode(data.country_code.toLowerCase());
        }
      })
      .catch(() => {
        console.log("IP detect failed, using default");
      });
  }, []);

  // 🔹 Step 2: Handle phone change
  const handleChange = (value) => {
    const fullPhone = "+" + value;
    setPhone(fullPhone);
    onChangeFinal(fullPhone);
  };

  return (
    <PhoneInput
      country={countryCode}   // auto detected
      value={phone}
      onChange={handleChange}
      enableSearch={true}     // user can change country
      countryCodeEditable={false}
      inputStyle={{ width: "100%", height: "45px" }}
    />
  );
}

export default PhoneField;
