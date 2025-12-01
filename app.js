const express = require("express");
const bodyParser = require("body-parser");
const ussdRouter = require("./routes/ussd");
const paymentService = require("./services/PaymentService");

const app = express();

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Handle URL-encoded bodies
app.use(bodyParser.json({ strict: false })); // Handle JSON bodies
app.use(express.json()); // Middleware to parse JSON requests

// Route definitions
app.use("/ussd", ussdRouter); // USSD routes (GMM flow)

// In-memory cache for deduplication
const processedTransactions = {};

// Time window for deduplication (1 minute in milliseconds)
const TIME_WINDOW = 60000;

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`USSD endpoint: http://localhost:${PORT}/ussd`);
  
  // Background status poller for safety when callback delays
  // Note: PaymentService already has a cron job that runs every 5 minutes
  // This is an additional safety check
  setInterval(async () => {
    try {
      await paymentService.get_status();
    } catch (e) {
      console.error("Polling error:", e);
    }
  }, 60000); // Check every minute
});


// const express = require("express");
// const bodyParser = require("body-parser");
// const ussdRouter = require("./routes/ussd");
// const paymentProcessorRouter = require("./routes/paymentProcessor");

// const app = express();

// // Middleware for parsing request bodies
// app.use(bodyParser.urlencoded({ extended: true })); // Handle URL-encoded bodies
// app.use(bodyParser.json({ strict: false })); // Handle JSON bodies

// // Route definitions
// app.use("/ussd", ussdRouter); // USSD routes
// app.use("/paymentProcessor", paymentProcessorRouter); // Payment processor routes

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

