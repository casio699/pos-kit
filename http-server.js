const http = require("http");

const server = http.createServer((req, res) => {
  console.log("=== REQUEST ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", req.headers);
  
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === "POST" && req.url === "/auth/login") {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    
    req.on("end", () => {
      console.log("Raw body:", body);
      
      try {
        const data = JSON.parse(body);
        console.log("Parsed data:", data);
        
        if (data.email === "admin@admin.com" && data.password === "admin123") {
          const response = {
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
          };
          
          console.log("SUCCESS: Sending response");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));
        } else {
          console.log("ERROR: Invalid credentials");
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Invalid email or password" }));
        }
      } catch (error) {
        console.error("ERROR parsing JSON:", error);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });
    
    return;
  }
  
  // Default response
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Not found" }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log("HTTP server running on http://localhost:" + PORT);
  console.log("Ready to accept requests...");
});
