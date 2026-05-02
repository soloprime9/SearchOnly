import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

function PhoneField({ onChangeFinal }) {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("in");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data.country_code) {
          setCountryCode(data.country_code.toLowerCase());

          onChangeFinal({
            phone: "",
            country: data.country_name || "",
            city: data.city || ""
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (value, country, e, formattedValue) => {
    const fullPhone = "+" + value;
    setPhone(fullPhone);

    // ⚡ FAST VALIDATION (no delay)
    const valid = value.length >= country.dialCode.length + 6; 
    setIsValid(valid);

    onChangeFinal(prev => ({
      ...prev,
      phone: fullPhone,
      isValid: valid
    }));
  };

  return (
    <div>
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
          border: isValid ? "2px solid #d1d5db" : "2px solid red"
        }}
      />

      {/* ⚡ Instant error */}
      {!isValid && (
        <p className="text-red-500 text-sm mt-1">
          Invalid phone number
        </p>
      )}
    </div>
  );
}

export default PhoneField;
