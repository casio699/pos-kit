const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Simple test endpoint
app.post("/test", (req, res) => {
  console.log("TEST ENDPOINT HIT");
  console.log("Body:", req.body);
  res.json({ message: "Test successful", body: req.body });
});

app.post("/auth/login", (req, res) => {
  console.log("=== LOGIN REQUEST ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", req.body);
  
  // Simple response without complex logic
  res.json({
    access_token: "mock-jwt-token-" + Date.now(),
    refresh_token: "mock-refresh-token",
    user: {
      id: "1",
      email: "admin@admin.com",
      first_name: "Admin",
      last_name: "User",
      roles: ["admin"],
      tenant_id: "tenant-1"
    }
  });
});

app.listen(PORT, () => {
  console.log("API server running on http://localhost:" + PORT);
  console.log("Ready to accept requests...");
});
