import React, { useEffect, useState } from "react";
import ClaimMyProfile from "./ClaimMyProfile";

const apiUrl = process.env.REACT_APP_API_URL;

// Button to claim a profile
const ClaimButton = ({ andy, user, onClaim }) => (
  <button
    style={{ padding: "5px 10px" }}
    onClick={() => onClaim(andy)}
    disabled={!user} // Disable if user is not logged in
  >
    {user ? "This is me!" : "Login to claim"}
  </button>
);

// Button to message a profile
const MessageButton = ({ andy, onMessage }) => (
  <button style={{ padding: "5px 10px" }} onClick={() => onMessage(andy)}>
    Message Me
  </button>
);

const AndyList = ({ user }) => {
  const [andys, setAndys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAndys, setFilteredAndys] = useState([]);
  const [selectedAndy, setSelectedAndy] = useState(null);
  const [dialogContent, setDialogContent] = useState(null); // State for dialog content

  useEffect(() => {
    const fetchAndys = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/profiles`);
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
    if (!user) {
      alert("You need to log in to claim a profile.");
      return;
    }
    setSelectedAndy(andy);
  };

  const handleMessageMeClick = (andy) => {
    alert("Coming Soon!!");
  };

  const handleEmailSubmit = (andy) => {
    alert("Coming Soon!!");
  };

  const handleClaimProfile = async (
    andy,
    email,
    allowAndyContact,
    allowPublicContact
  ) => {
    if (!andy) {
      console.error("Missing required arguments for handleClaimProfile");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/claimProfile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({
          profileId: andy.profile_id,
          email: email,
          allowAdminContact: true, // Admin contact is always true
          allowAndyContact, // User-defined preference
          allowPublicContact, // User-defined preference
        }),
      });

      if (response.ok) {
        const updatedResponse = await fetch(`${apiUrl}/api/profiles`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setAndys(updatedData);
          setSelectedAndy(null); // Close the modal after successful update
        } else {
          console.error("Failed to fetch updated Andys after profile claim.");
        }
      } else if (response.status === 409) {
        setSelectedAndy(null); // Close the claim modal
        setDialogContent(
          "It appears that you have already claimed a profile. If you think this is an error, please message the admin using the button above."
        ); // Set the dialog content
      } else {
        console.error("Failed to claim profile. Please try again.");
      }
    } catch (error) {
      console.error("Error claiming profile:", error);
    }
  };

  const closeModal = () => {
    setSelectedAndy(null);
  };

  const closeDialog = () => {
    setDialogContent(null); // Close the dialog by clearing its content
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>List of Andy Profiles </h2>

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
            <th>Name</th>
            <th>Job Title</th>
            <th>Company</th>
            <th>Location</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
  {filteredAndys.map((andy) => {
    const isCurrentUser = user?.user.profile_id === andy.profile_id;
    const isPending = isCurrentUser && andy.isVerified === 0; // Check if the current user's profile is not verified
    const canMessage = andy.isVerified && (
      andy.allow_public_contact ||
      (andy.allow_andy_contact && user?.user.verified));

    return (
      <tr
        key={andy.profile_id}
        style={{
          backgroundColor: isCurrentUser ? "#ffebcd" : "transparent", // Highlight "This is you" row
        }}
      >
        <td>{andy.first_name} {andy.last_name}</td>
        <td>{andy.job_title || "Not specified"}</td>
        <td>{andy.company || "Not specified"}</td>
        <td>
          {andy.location_city && andy.location_state && andy.location_country
            ? `${andy.location_city}, ${andy.location_state}, ${andy.location_country}`
            : "Not specified"}
        </td>
        <td style={{ textAlign: "center" }}>
          {isPending ? (
            "Pending" // Show Pending if this is the user's row and it is not verified
          ) : isCurrentUser ? (
            "This is you" // Show This is you for verified profiles
          ) : !user?.user.profile_id && !andy.hasAccount ? (
            <ClaimButton
              andy={andy}
              user={user}
              onClaim={handleThisIsMeClick}
            />
          ) : canMessage ? (
            <MessageButton
              andy={andy}
              onMessage={handleMessageMeClick}
            />
          ) : null}
        </td>
      </tr>
    );
  })}
</tbody>
      </table>

      {/* Modal for Email Form */}
      {selectedAndy && (
        <ClaimMyProfile
          andy={selectedAndy}
          user={user}
          onClose={closeModal}
          onSubmit={handleClaimProfile}
        />
      )}

      {/* Dialog Box */}
      {dialogContent && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#eee",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            zIndex: 1000,
            textAlign: "center",
          }}
        >
          <p>{dialogContent}</p>
          <button
            onClick={closeDialog}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};

export default AndyList;
