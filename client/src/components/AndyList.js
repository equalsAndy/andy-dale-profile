import React, { useEffect, useState } from "react";


import ClaimMyProfile from "./ClaimMyProfile";

const apiUrl = process.env.REACT_APP_API_URL;

const AndyList = () => {
  const [andys, setAndys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAndys, setFilteredAndys] = useState([]);
  const [selectedAndy, setSelectedAndy] = useState(null); // Andy selected for email
  const [email, setEmail] = useState(""); // Email input value

  useEffect(() => {
    const fetchAndys = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/andys`);
        const data = await response.json();
        setAndys(data);
        setFilteredAndys(data);
      } catch (error) {
        console.error("Error fetching Andy profiles:", error);
      }
    };

    fetchAndys();
  }, []);

  useEffect(() => {
    const results = andys.filter(
      (andy) =>
        `${andy.first_name} ${andy.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (andy.job_title &&
          andy.job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (andy.location_city &&
          andy.location_city
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (andy.location_state &&
          andy.location_state
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (andy.location_country &&
          andy.location_country
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );
    setFilteredAndys(results);
  }, [searchTerm, andys]);

  const handleThisIsMeClick = (andy) => {
    setSelectedAndy(andy);
    setEmail("");
  };

  const handleMessageMeClick = (andy) => {
   // setSelectedAndy(andy);
    alert("Coming Soon!!");
  };

  const handleEmailSubmit = async (
    andy,
    email,
    allowAndyContact,
    allowPublicContact
  ) => {
    if (!email || !andy) {
      console.error("Missing required arguments for handleEmailSubmit");
      return;
    }
  
    try {
      const response = await fetch(`${apiUrl}/api/addEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: andy.user_id,
          emailAddress: email,
          isPrimary: 1, // Default to primary email
          allowAdminContact: true, // Admin contact is always true
          allowAndyContact, // User-defined preference
          allowPublicContact, // User-defined preference
        }),
      });
  
      if (response.ok) {
        // Re-fetch data to get the updated list
        const updatedResponse = await fetch(`${apiUrl}/api/andys`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setAndys(updatedData);
          setSelectedAndy(null); // Close the modal after successful update
        } else {
          console.error("Failed to fetch updated Andys after email submission.");
        }
      } else if (response.status === 409) {
        // Handle duplicate email error
        alert("This email address is already registered.");
      } else {
        console.error("Failed to add email. Please try again.");
      }
    } catch (error) {
      console.error("Error adding email:", error);
    }
  };

  const closeModal = () => {
    setSelectedAndy(null);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
    
      <h2>List of Andy Profiles</h2>

      <input
        type="text"
        placeholder="Search by name, location, or job title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "16px",
          width: "80%",
          marginBottom: "20px",
        }}
      />

      <table
        style={{
          width: "80%",
          margin: "0 auto",
          borderCollapse: "collapse",
          fontSize: "18px",
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
              Name
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
              Job Title
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
              Company
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
              Location
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredAndys.map((andy) => (
            <tr key={andy.user_id} style={{ textAlign: "left" }}>
              <td style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
                {andy.first_name} {andy.last_name}
              </td>
              <td style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
                {andy.job_title || "Not specified"}
              </td>
              <td style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
                {andy.company || "Not specified"}
              </td>
              <td style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
                {andy.location_city &&
                andy.location_state &&
                andy.location_country
                  ? `${andy.location_city}, ${andy.location_state}, ${andy.location_country}`
                  : "Not specified"}
              </td>
              <td
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                {andy.has_email ? (
                  andy.allow_andy_contact || andy.allow_public_contact ? (
                    <button 
                    style={{ padding: "5px 10px" }} 
                    onClick={() => handleMessageMeClick(andy)}
                    >Message Me</button>
                  ) : null // No button if both flags are false
                ) : (
                  <button
                    style={{ padding: "5px 10px" }}
                    onClick={() => handleThisIsMeClick(andy)}
                  >
                    This is me!
                  </button>
                )}
                {andy.allow_admin_contact && (
                  <span
                    style={{
                      marginLeft: "10px",
                      fontSize: "12px",
                      color: "#888",
                    }}
                  ></span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Email Form */}
      {selectedAndy && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          <h3>
            Add Your Email for {selectedAndy.first_name}{" "}
            {selectedAndy.last_name}
          </h3>
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "10px", fontSize: "16px", marginRight: "10px" }}
            />
            <button
              type="submit"
              style={{ padding: "10px 20px", fontSize: "16px" }}
            >
              Submit
            </button>
            <button
              type="button"
              onClick={closeModal}
              style={{
                padding: "10px 20px",
                marginLeft: "10px",
                fontSize: "16px",
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Modal Overlay */}
      {selectedAndy && (
        <ClaimMyProfile
          andy={selectedAndy}
          onClose={closeModal}
          onSubmit={handleEmailSubmit}
        />
      )}
    </div>
  );
};

export default AndyList;
