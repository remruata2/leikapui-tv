require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the React app
app.use(express.static(path.join(process.cwd(), "dist")));

// The "catchall" handler: for any request that doesn't
// match one above, send back index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "dist/index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
