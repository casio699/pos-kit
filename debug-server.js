const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post("/auth/login", (req, res) => {
  console.log("=== LOGIN REQUEST ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", req.body);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log("ERROR: Missing email or password");
      return res.status(400).json({ message: "Email and password required" });
    }
    
    console.log("Attempting login for:", email);
    
    const user = {
      id: "1",
      email: "admin@admin.com",
      password: "admin123",
      first_name: "Admin",
      last_name: "User",
      roles: ["admin"],
      tenant_id: "tenant-1"
    };
    
    if (email !== user.email || password !== user.password) {
      console.log("ERROR: Invalid credentials");
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    console.log("SUCCESS: Login successful for:", email);
    
    const response = {
      access_token: "mock-jwt-token-" + Date.now(),
      refresh_token: "mock-refresh-token",
      user: userWithoutPassword
    };
    
    console.log("Sending response:", JSON.stringify(response, null, 2));
    
    res.json(response);
  } catch (error) {
    console.error("CATCH BLOCK ERROR:", error);
    res.status(500).json({ 
      message: "Login failed due to an internal server error",
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log("API server running on http://localhost:" + PORT);
  console.log("Ready to accept requests...");
});
