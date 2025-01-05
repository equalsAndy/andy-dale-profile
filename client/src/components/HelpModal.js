import React, { useState } from "react";

const HelpModal = ({ onClose }) => {
  // Define help topics inside HelpModal
  const topics = [
    {
      id: "signupLogin",
      title: "Signup and Login",
      videoUrl: "https://share.synthesia.io/embeds/videos/a9e0765b-d3e5-445b-b19c-90777bc183ae",
    },
    {
      id: "messageMe",
      title: "Message Me Feature",
      videoUrl: "https://share.synthesia.io/embeds/videos/020a9b1b-aa22-4d63-b7bf-b09c226311ff",
    },
    {
      id: "claimProfile",
      title: "Claiming Your Profile",
      videoUrl: "https://share.synthesia.io/embeds/videos/5315f0d2-5856-43b7-9011-d2ec736cc3f2",
    
    },
  ];


  const [selectedTopic, setSelectedTopic] = useState(topics[0]); // Default to the first topic

  if (!topics || topics.length === 0) return null; // Guard for empty topics

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        zIndex: 1000,
        width: "80%",
        maxWidth: "600px",
        textAlign: "center",
      }}
    >
      <h3>Help Topics</h3>
      <div style={{ marginBottom: "20px" }}>
        {/* List of Topics */}
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => setSelectedTopic(topic)} // Update selected topic
            style={{
              padding: "10px",
              margin: "5px",
              backgroundColor: selectedTopic.id === topic.id ? "#007BFF" : "#ccc",
              color: selectedTopic.id === topic.id ? "white" : "black",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {topic.title}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          aspectRatio: "16/9",
          marginBottom: "20px",
        }}
      >
        <iframe
          src={selectedTopic.videoUrl}
          loading="lazy"
          title={selectedTopic.title}
          allowFullScreen
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      </div>

      <button
        onClick={onClose}
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
        Close
      </button>
    </div>
  );
};

export default HelpModal;