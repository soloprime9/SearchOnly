'use client';
import React, { useState } from "react";
import axios from "axios";
// import useRouter

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "", 
    password: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  // const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await axios.post("https://backendk-z915.onrender.com/user/add", formData)

    
     
    .then( (result) =>{
        console.log("Result: ", result);
        setSuccessMessage("Successfully Created Account Your");
        window.location.href=  "/login";
        
      } )
      
     .catch( (error) => {
      console.log("Error:", error.response.data.message);
      setSuccessMessage(error.response.data.message);
      
      }
      
    )
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-80 p-5 rounded-lg border-2 border-white-500 bg-orange-500 shadow-2xl">
        <h2 className="font-bold text-center text-4xl py-3">SignUp Form</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Name</label>
          <input
            id="username"
            type="text"
            name="username"
            required
            value={formData.username}
            onChange={handleInputChange}
            className="w-full border-2 rounded-lg border-blue-500 p-1 mb-2"
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full border-2 border-blue-500 p-1 mb-2 rounded-lg"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleInputChange}
            className="w-full border-2 border-blue-500 rounded-lg p-1 mb-2"
          />

          <a
            href="fondpeace.com"
            className="link hover:underline text-blue-500 w-full mb-2"
          >
            Forget Password
          </a>
          <button
            type="submit"
            className="w-full border-2 border-orange-500 rounded-2xl p-2 mt-2 text-white font-bold text-xl bg-blue-500"
          >
            Signup Now
          </button>
        </form>

        {/* Success and Error message placeholders */}
        {successMessage && (
          <div id="success-message" className="font-bold text-white mt-2">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div id="error-message" className="font-bold text-white mt-2">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp
