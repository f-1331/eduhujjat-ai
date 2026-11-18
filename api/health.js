export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    service: 'EduHujjat AI',
    runtime: 'vercel-serverless',
    timestamp: new Date().toISOString(),
  });
}
