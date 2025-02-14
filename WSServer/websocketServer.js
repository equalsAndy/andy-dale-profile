const WebSocket = require("ws");
const { toggleLight } = require("./smarthomeController");

const PORT = 3030;
const wss = new WebSocket.Server({ port: PORT });

console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  console.log("🔌 New client connected");

  ws.send(JSON.stringify({ message: "Welcome to the WebSocket server!" }));

  ws.on("message", async (data) => {
    const message = data.toString().trim();
    console.log(`📩 Received: ${message}`);

    if (message === "toggle") {
      // Call the toggleLight function from smarthomeController.js
      const result = await toggleLight();

      if (result.success) {
        // Broadcast new light state to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ lightState: result.LivingroomLight ? "ON" : "OFF" }));
          }
        });
      }
    }
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });
});