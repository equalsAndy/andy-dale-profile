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
  
  // Light state
  let LivingroomLight = false;
  
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
  
  // Function to toggle the light (now callable by WebSocket server)
  const toggleLight = async () => {
    try {
      LivingroomLight = !LivingroomLight;
      console.log(`Toggling light: ${LivingroomLight ? "ON" : "OFF"}`);
  
      // Send the event to Sinric Pro
      await raiseEvent(sinricpro, eventNames.contact, CONTACT_ID, {
        state: LivingroomLight ? "open" : "closed",
      });
  
      return { success: true, LivingroomLight, message: "Event sent to Sinric Pro" };
    } catch (error) {
      console.error("❌ Error sending event to Sinric Pro:", error);
      return { success: false, error: error.message };
    }
  };
  
  module.exports = {
    toggleLight,
  };