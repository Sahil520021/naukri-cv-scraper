/**
 * ============================================================================
 * NAUKRI CV SCRAPER API
 * ============================================================================
 * 
 * Vercel Serverless Function that proxies requests to the n8n webhook
 * for scraping Naukri.com CV/resume data.
 * 
 * Endpoint: POST /api/scrape
 * 
 * Request Body:
 *   - curlCommand (string, required): cURL command from Chrome DevTools
 *   - maxResults  (number, optional): Maximum profiles to scrape (default: 10)
 * 
 * Response:
 *   - success (boolean): Whether the scrape was successful
 *   - data (object): Scraped candidate data from n8n
 *   - stats (object): Scraping statistics
 * 
 * ============================================================================
 */

import axios from 'axios';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // Default n8n webhook URL (can be overridden via environment variable)
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'https://n8n.grrbaow.com/webhook/naukri-scrapper',

    // Optional webhook secret for authentication
    webhookSecret: process.env.N8N_WEBHOOK_SECRET || null,

    // Request timeout (10 minutes for large scrapes)
    timeout: 600000
};

// ============================================================================
// CORS HEADERS
// ============================================================================

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key, X-RapidAPI-Host',
    'Content-Type': 'application/json'
};

// ============================================================================
// LOGGING HELPERS
// ============================================================================

const log = {
    banner: (text) => console.log(`${'='.repeat(60)}\n${text}\n${'='.repeat(60)}`),
    section: (text) => console.log(`${'─'.repeat(60)}\n${text}`),
    info: (msg) => console.log(`📊 ${msg}`),
    success: (msg) => console.log(`✅ ${msg}`),
    warning: (msg) => console.log(`⚠️  ${msg}`),
    error: (msg) => console.error(`❌ ${msg}`),
    tip: (msg) => console.log(`💡 ${msg}`),
    step: (msg) => console.log(`   ${msg}`)
};

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default async function handler(req, res) {
    // Set CORS headers for all responses
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    // Handle preflight OPTIONS request (required for CORS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed. Use POST request.',
            usage: {
                method: 'POST',
                body: {
                    curlCommand: 'string (required) - cURL command from Chrome DevTools',
                    maxResults: 'number (optional) - Maximum profiles to scrape (default: 10)'
                }
            }
        });
    }

    const startTime = Date.now();

    try {
        // ========== START ==========
        log.banner('🚀 NAUKRI CV SCRAPER API');

        // --------------------------------------------------------------------
        // 1. PARSE AND VALIDATE INPUT
        // --------------------------------------------------------------------

        const { curlCommand, maxResults = 10 } = req.body;

        if (!curlCommand) {
            log.error('cURL command is required');
            return res.status(400).json({
                success: false,
                error: 'curlCommand is required',
                usage: {
                    curlCommand: 'The complete cURL command copied from Chrome DevTools Network tab',
                    maxResults: 'Optional number of profiles to scrape (default: 10)'
                }
            });
        }

        // Validate maxResults is a reasonable number
        const validatedMaxResults = Math.min(Math.max(1, parseInt(maxResults) || 10), 1000);

        log.info(`Requested profiles: ${validatedMaxResults}`);
        log.info(`n8n webhook: ${CONFIG.n8nWebhookUrl}`);
        log.info(`Started at: ${new Date().toISOString()}`);
        console.log('');
        console.log('📡 Calling n8n workflow...');

        // --------------------------------------------------------------------
        // 2. CALL N8N WEBHOOK
        // --------------------------------------------------------------------

        const n8nResponse = await axios.post(
            CONFIG.n8nWebhookUrl,
            {
                curlCommand,
                maxResults: validatedMaxResults
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization header if webhook secret is configured
                    ...(CONFIG.webhookSecret && {
                        'Authorization': `Bearer ${CONFIG.webhookSecret}`
                    })
                },
                timeout: CONFIG.timeout
            }
        );

        log.success('n8n workflow completed successfully');
        console.log('');

        // --------------------------------------------------------------------
        // 3. PROCESS RESPONSE
        // --------------------------------------------------------------------

        const results = n8nResponse.data;
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

        let processedData = null;
        let actualCount = 0;

        // Handle different response formats from n8n
        if (results.candidates && Array.isArray(results.candidates)) {
            actualCount = results.candidates.length;
            log.info(`Processing ${actualCount} candidates from n8n`);
            processedData = {
                success: true,
                totalCandidates: results.totalCandidates || actualCount,
                scrapedAt: results.scrapedAt || new Date().toISOString(),
                candidates: results.candidates
            };
        } else if (Array.isArray(results)) {
            actualCount = results.length;
            log.info(`Processing ${actualCount} results from n8n`);
            processedData = {
                success: true,
                totalProfiles: actualCount,
                profiles: results
            };
        } else if (results && typeof results === 'object') {
            actualCount = 1;
            log.info('Processing single result from n8n');
            processedData = {
                success: true,
                data: results
            };
        } else {
            log.warning('Unexpected response format from n8n');
            processedData = {
                success: true,
                data: results
            };
        }

        // ========== RESULTS ANALYSIS ==========
        console.log('');
        log.banner('📈 SCRAPING RESULTS');
        log.success(`Profiles received: ${actualCount}`);
        log.info(`Profiles requested: ${validatedMaxResults}`);
        log.info(`Time taken: ${elapsedTime}s`);
        console.log('');

        // ========== QUOTA/LIMIT DETECTION ==========
        const shortfall = validatedMaxResults - actualCount;
        let quotaWarning = null;

        if (shortfall > 0 && actualCount > 0) {
            const percentageGot = ((actualCount / validatedMaxResults) * 100).toFixed(1);

            log.warning('ATTENTION: Did not get all requested profiles');
            log.section(`Missing: ${shortfall} profiles (got ${percentageGot}%)`);
            console.log('');
            log.tip('Possible reasons:');

            // Detect specific quota patterns
            if (actualCount % 50 === 0) {
                const pagesGot = actualCount / 50;
                const pagesRequested = Math.ceil(validatedMaxResults / 50);
                log.step(`📄 Got ${pagesGot} pages out of ${pagesRequested} requested pages`);
                log.step('• Naukri CV viewing quota exhausted');
                log.step('• Daily/monthly limit reached');
                log.step('• Check your Naukri Resdex dashboard for quota status');
            } else if (actualCount < 100) {
                log.step('⚠️  Low profile count - Likely causes:');
                log.step('• Naukri CV quota nearly exhausted');
                log.step('• CAPTCHA triggered (reduce scraping speed in n8n)');
                log.step('• Session expired midway');
            } else {
                log.step('📊 Partial success - Possible causes:');
                log.step('• CV viewing quota ran out partway through');
                log.step('• CAPTCHA triggered after viewing many profiles');
                log.step('• Session timeout or network issues');
            }

            console.log('');
            log.tip('Recommended actions:');
            log.step('1. Login to Naukri Resdex and check CV viewing quota');
            log.step('2. Wait for quota reset (check daily/monthly limits)');
            log.step('3. Get fresh cookies (new cURL command from Chrome DevTools)');
            log.step('4. Reduce maxResults to match available quota');
            console.log('');

            quotaWarning = {
                message: 'Did not get all requested profiles',
                requested: validatedMaxResults,
                received: actualCount,
                shortfall: shortfall,
                percentageReceived: percentageGot,
                likelyQuotaIssue: actualCount % 50 === 0,
                recommendations: [
                    'Check Naukri Resdex CV viewing quota',
                    'Get fresh cURL command',
                    'Reduce maxResults'
                ]
            };

        } else if (actualCount === 0) {
            log.error('CRITICAL: No profiles scraped!');
            log.section('Likely causes:');
            log.step('❌ Cookies expired - Get fresh cURL from Chrome DevTools');
            log.step('❌ Account quota fully exhausted - Check Naukri dashboard');
            log.step('❌ Invalid search parameters in n8n workflow');
            log.step('❌ Network/authentication issues');
            console.log('');
            log.tip('Immediate actions:');
            log.step('1. Open Naukri Resdex in Chrome incognito mode');
            log.step('2. Perform a search');
            log.step('3. Copy fresh cURL command from Network tab');
            log.step('4. Check Naukri account quota status');
            console.log('');

            quotaWarning = {
                message: 'No profiles scraped',
                critical: true,
                recommendations: [
                    'Get fresh cURL command',
                    'Check if cookies expired',
                    'Verify Naukri account quota'
                ]
            };

        } else {
            log.success('SUCCESS: Got all requested profiles!');
            console.log('');
        }

        // ========== FINAL SUMMARY ==========
        log.banner('🎉 SCRAPING COMPLETE');
        log.success(`Total profiles saved: ${actualCount}`);
        log.info(`Success rate: ${((actualCount / validatedMaxResults) * 100).toFixed(1)}%`);
        log.info(`Total time: ${elapsedTime}s`);

        if (shortfall > 0) {
            console.log('');
            log.warning('NOTE: Partial results (see quota details above)');
        }

        console.log('');
        log.success('API request completed successfully');
        console.log('='.repeat(60));

        // --------------------------------------------------------------------
        // 4. BUILD RESPONSE WITH STATS
        // --------------------------------------------------------------------

        const response = {
            ...processedData,
            stats: {
                requested: validatedMaxResults,
                received: actualCount,
                successRate: `${((actualCount / validatedMaxResults) * 100).toFixed(1)}%`,
                timeTakenSeconds: parseFloat(elapsedTime),
                quotaWarning: shortfall > 0 && actualCount > 0
            },
            ...(quotaWarning && { quotaWarning })
        };

        return res.status(200).json(response);

    } catch (error) {
        // ========== ERROR HANDLING ==========
        console.error('');
        log.banner('❌ SCRAPING FAILED');
        log.error(`Error: ${error.message}`);

        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

        // Provide detailed error info
        if (error.response?.data) {
            console.error('');
            console.error('📋 Error details from n8n:');
            console.error(JSON.stringify(error.response.data, null, 2));
        }

        console.error('');

        // Determine error type and provide helpful message
        let statusCode = 500;
        let errorMessage = error.message;
        let guidance = [];

        if (error.message.includes('curlCommand is required')) {
            log.tip('Fix: Provide curlCommand in request body');
            guidance = ['Provide curlCommand in request body'];
        } else if (error.code === 'ECONNREFUSED') {
            statusCode = 503;
            errorMessage = 'n8n webhook is not accessible';
            log.tip('Fix: n8n webhook is not accessible');
            log.step('• Check n8n is running');
            log.step('• Verify webhook URL is correct');
            guidance = ['Check if n8n is running', 'Verify webhook URL is correct'];
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            statusCode = 504;
            errorMessage = 'Request timed out';
            log.tip('Fix: Request timed out');
            log.step('• Reduce maxResults');
            log.step('• Check n8n workflow performance');
            log.step('• Increase timeout if needed');
            guidance = ['Reduce maxResults', 'Check n8n workflow performance'];
        } else if (error.response?.status === 401 || error.response?.status === 403) {
            statusCode = 401;
            errorMessage = 'Authentication failed';
            log.tip('Fix: Authentication failed');
            log.step('• Get fresh cURL command with valid cookies');
            log.step('• Check Naukri login session is active');
            guidance = ['Get fresh cURL command with valid cookies', 'Check Naukri login session'];
        } else if (error.response?.status === 500) {
            statusCode = 502;
            errorMessage = 'n8n workflow error';
            log.tip('Fix: n8n workflow error');
            log.step('• Check n8n workflow logs for details');
            log.step('• Verify workflow configuration');
            log.step('• Test with smaller maxResults first');
            guidance = ['Check n8n workflow logs', 'Test with smaller maxResults'];
        } else {
            log.tip('Fix: Check error details above');
            log.step('• Review n8n workflow logs');
            log.step('• Verify all configurations');
            log.step('• Test with curl command manually');
            guidance = ['Review n8n workflow logs', 'Verify configurations'];
        }

        console.error('');
        console.error('='.repeat(60));

        return res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: error.response?.data || null,
            guidance: guidance.length > 0 ? guidance : undefined,
            stats: {
                timeTakenSeconds: parseFloat(elapsedTime)
            }
        });
    }
}
