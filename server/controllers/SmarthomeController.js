const {
    SinricPro,
    startSinricPro,
    raiseEvent,
    eventNames,
  } = require("sinricpro");
  
  // Sinric Pro Credentials
  const APP_KEY = "5c66607b-7a14-48e2-8c24-433d6b1ca80f";
  const APP_SECRET = "8a947e10-ff71-4935-8fee-fca82f87fbd4-b9badf28-71a2-4a8b-b839-3998331b952f";
  const CONTACT_ID = "678c18c9f25540068f826677";
  
  // Device IDs
  const deviceIds = [CONTACT_ID];
  
  // Toggle state
  let ledState = false;
  
  // Define callback functions
  const setPowerState = async (deviceid, data) => {
    console.log(`Device ${deviceid} received power state change:`, data);
    return true;
  };
  
  const onDisconnect = () => {
    console.log("🔴 Disconnected from Sinric Pro");
  };
  
  const onConnected = () => {
    console.log("🟢 Connected to Sinric Pro");
  };
  
  // Initialize Sinric Pro WebSocket
  const sinricpro = new SinricPro(APP_KEY, deviceIds, APP_SECRET, true);
  const callbacks = { setPowerState, onDisconnect, onConnected };
  
  // Start Sinric Pro WebSocket
  startSinricPro(sinricpro, callbacks);
  
  // API Function to toggle the light
  const toggleLight = async (req, res) => {
    try {
      ledState = !ledState;
      console.log(`Toggling light: ${ledState ? "ON" : "OFF"}`);
  
      // Send the event to Sinric Pro
      await raiseEvent(sinricpro, eventNames.contact, CONTACT_ID, {
        state: ledState ? "open" : "closed",
      });
  
      res.json({ success: true, ledState, message: "Event sent to Sinric Pro" });
    } catch (error) {
      console.error("❌ Error sending event to Sinric Pro:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  module.exports = {
    toggleLight,
  };