/**
 * ============================================================================
 * HEALTH CHECK ENDPOINT
 * ============================================================================
 * 
 * Simple endpoint to verify the API is running.
 * Useful for monitoring and RapidAPI health checks.
 * 
 * Endpoint: GET /api/health
 * 
 * ============================================================================
 */

export default function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.status(200).json({
        status: 'ok',
        service: 'Naukri CV Scraper API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
}
