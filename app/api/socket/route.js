export default function handler(req, res) {
  // Simply return a basic response to prevent 404
  res.status(200).json({
    message: "Socket.io endpoint - not implemented",
    timestamp: new Date().toISOString(),
  });
}
