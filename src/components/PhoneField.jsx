import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

function PhoneField({ onChangeFinal }) {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("in");
  const [geoData, setGeoData] = useState({
    country: "",
    city: ""
  });

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data.country_code) {
          setCountryCode(data.country_code.toLowerCase());
        }

        setGeoData({
          country: data.country_name || "",
          city: data.city || ""
        });
      })
      .catch(() => {
        console.log("IP detect failed");
      });
  }, []);

  const handleChange = (value) => {
    const fullPhone = "+" + value;
    setPhone(fullPhone);

    // ✅ send ALL data to parent
    onChangeFinal({
      phone: fullPhone,
      country: geoData.country,
      city: geoData.city
    });
  };

  return (
    <PhoneInput
      country={countryCode}
      value={phone}
      onChange={handleChange}
      enableSearch={true}
      countryCodeEditable={false}
      inputStyle={{
        width: "100%",
        height: "48px",
        borderRadius: "12px",
        border: "2px solid #d1d5db"
      }}
      buttonStyle={{
        borderTopLeftRadius: "12px",
        borderBottomLeftRadius: "12px"
      }}
    />
  );
}

export default PhoneField;
