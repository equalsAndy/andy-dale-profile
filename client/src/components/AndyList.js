import React, { useEffect, useState } from "react";
import ClaimMyProfile from "./ClaimMyProfile";
import { Link } from "react-router-dom";
import HelpModal from "./HelpModal";

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

const AndyList = ({ user, setUser }) => {
  const userProfileId = user?.user?.profile_id;
  const userVerified = user?.user?.verified;
  const [andys, setAndys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAndys, setFilteredAndys] = useState([]);
  const [selectedAndy, setSelectedAndy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const helpTopics = [
    {
      id: "messageMe",
      title: "Message Me Feature",
      videoUrl: "https://share.synthesia.io/embeds/videos/020a9b1b-aa22-4d63-b7bf-b09c226311ff",
    },
    {
      id: "claimProfile",
      title: "Claiming Your Profile",
      videoUrl: "https://share.synthesia.io/embeds/videos/12345678-claim-profile",
    },
  ];
  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch Andy profiles
  const fetchAndys = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/profiles`);
      if (response.ok) {
        const data = await response.json();
        setAndys(data);
        setFilteredAndys(data);
      } else {
        console.error("Failed to fetch Andy profiles:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching Andy profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndys();
  }, [refreshKey]);

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

  // Fetch updated user data
  const refreshUser = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/user`, {
        method: "GET",
        credentials: "include", // Ensure cookies are sent
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser); // Update the user state with the new data
      } else {
        console.error("Failed to refresh user:", response.statusText);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  // Handle claiming a profile
  const handleClaimSubmit = async (andy, email, allowAndyContact, allowPublicContact) => {
    try {
      const response = await fetch(`${apiUrl}/api/claimProfile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profileId: andy.profile_id,
          email,
          allowAndyContact,
          allowPublicContact,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to claim profile.");
      }

      setSelectedAndy(null); // Close the modal
      setRefreshKey((prev) => prev + 1); // Refresh the profile list
      await refreshUser(); // Refresh the current user data
    } catch (error) {
      console.error(`Error claiming profile: ${error.message}`);
    }
  };

  const handleMessageMeClick = async (andy) => {
    const message = prompt(`Enter your message for ${andy.first_name} ${andy.last_name}:`);
    if (!message) {
      alert("Message cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/sendAndyToAndyMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          recipientProfileId: andy.profile_id,
          subject: `Message from a user via AndyDale.me`,
          message,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Message sent successfully! Alias: ${result.alias}`);
      } else {
        const error = await response.json();
        alert(`Failed to send message: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      alert("Error sending message. Please try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "10px" }}>
      {!user && (
        <div
          style={{
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
            textAlign: "center",
            fontSize: "14px",
            color: "#333",
            width: "80%",
            margin: "0 auto",
          }}
        >
          Anyone can sign up by clicking <strong>'Login'</strong> and then{" "}
          <strong>'Sign Up'</strong>. Once you claim a profile, your claim will
          remain in a pending state until an Admin verifies that you are Andy
          Dale and that the profile belongs to you.
        </div>
      )}
      <h2>
        List of Andy Profiles
        <button
          onClick={() => setShowHelpModal(true)}
          style={{
            marginLeft: "10px",
            cursor: "pointer",
          }}
          title="Learn about the features"
        >
          <span style={{ fontSize: "20px", fontWeight: "bold" }}>Help Me</span>
        </button>
      </h2>

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
          margin: "0 auto",
          display: "block",
        }}
      />

      {loading && <p>Loading...</p>}

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
            const isCurrentUser = userProfileId === andy.profile_id;
            const isPending = isCurrentUser && andy.isVerified === 0;
            const canMessage =
              andy.allow_public_contact ||
              (andy.allow_andy_contact && userVerified);

            return (
              <tr
                key={andy.profile_id}
                style={{
                  backgroundColor: isCurrentUser ? "#ffebcd" : "transparent",
                }}
              >
                <td>
                  {andy.first_name} {andy.last_name}
                </td>
                <td>{andy.job_title || "Not specified"}</td>
                <td>{andy.company || "Not specified"}</td>
                <td>
                  {andy.location_city && andy.location_state && andy.location_country
                    ? `${andy.location_city}, ${andy.location_state}, ${andy.location_country}`
                    : "Not specified"}
                </td>
                <td style={{ textAlign: "center" }}>
                  {isPending ? (
                    "Pending"
                  ) : isCurrentUser ? (
                    <Link to="/profile">
                      <button>View My Profile</button>
                    </Link>
                  ) : !userProfileId && !andy.hasAccount ? (
                    <ClaimButton
                      andy={andy}
                      user={user}
                      onClaim={() => setSelectedAndy(andy)}
                    />
                  ) : canMessage ? (
                    <MessageButton andy={andy} onMessage={handleMessageMeClick} />
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedAndy && (
        <ClaimMyProfile
          key={selectedAndy.profile_id}
          andy={selectedAndy}
          user={user}
          onClose={() => setSelectedAndy(null)}
          onSubmit={handleClaimSubmit}
        />
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <HelpModal
          topics={helpTopics}
          onClose={() => setShowHelpModal(false)}
        />
      )}
    </div>
  );
};

export default AndyList;