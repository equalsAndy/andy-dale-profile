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
  let sinricConnected = false; // Track Sinric Pro connection state
  
  // Define callback functions
  const setPowerState = async (deviceid, data) => {
    console.log(`Device ${deviceid} received power state change:`, data);
    return true;
  };
  
  const onDisconnect = () => {
    console.log("🔴 Disconnected from Sinric Pro");
    sinricConnected = false;
    reconnectSinric();
  };
  
  const onConnected = () => {
    console.log("🟢 Connected to Sinric Pro");
    sinricConnected = true;
  };
  
  // Initialize Sinric Pro WebSocket
  let sinricpro = new SinricPro(APP_KEY, deviceIds, APP_SECRET, true);
  const callbacks = { setPowerState, onDisconnect, onConnected };
  
  // Function to reconnect to Sinric Pro
  const reconnectSinric = () => {
    console.log("🔄 Attempting to reconnect to Sinric Pro...");
    sinricpro = new SinricPro(APP_KEY, deviceIds, APP_SECRET, true);
    startSinricPro(sinricpro, callbacks);
  };
  
  // Function to toggle the light (retry logic included)
  const toggleLight = async () => {
    try {
      LivingroomLight = !LivingroomLight;
      console.log(`Toggling light: ${LivingroomLight ? "ON" : "OFF"}`);
  
      // Try sending the event
      await raiseEvent(sinricpro, eventNames.contact, CONTACT_ID, {
        state: LivingroomLight ? "open" : "closed",
      });
  
      return { success: true, LivingroomLight, message: "Event sent to Sinric Pro" };
    } catch (error) {
      console.error("❌ Error sending event to Sinric Pro:", error);
  
      // If connection error, attempt reconnect & retry
      if (!sinricConnected) {
        console.log("🔄 Sinric Pro is disconnected. Reconnecting...");
        reconnectSinric();
  
        setTimeout(async () => {
          console.log("♻️ Retrying event after reconnecting...");
          try {
            await raiseEvent(sinricpro, eventNames.contact, CONTACT_ID, {
              state: LivingroomLight ? "open" : "closed",
            });
            console.log("✅ Successfully retried event.");
          } catch (retryError) {
            console.error("❌ Retried event failed:", retryError);
          }
        }, 3000); // Wait 3 seconds before retrying
      }
  
      return { success: false, error: error.message };
    }
  };
  
  // Start Sinric Pro WebSocket
  startSinricPro(sinricpro, callbacks);
  
  module.exports = {
    toggleLight,
  };