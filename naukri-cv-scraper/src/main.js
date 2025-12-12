import { Actor } from 'apify';
import axios from 'axios';

// CONFIGURATION - Update your n8n webhook URL here
const CONFIG = {
    n8nWebhookUrl: 'https://n8n.srv936319.hstgr.cloud/webhook/naukri-scraper',
    // Add optional authentication if you secure your webhook
    webhookSecret: process.env.N8N_WEBHOOK_SECRET || null
};

await Actor.init();

try {
    Actor.log.info('🚀 Naukri CV Scraper - Calling n8n workflow');
    
    // Get input from user
    const input = await Actor.getInput();
    const {
        cookies,
        requirementId,
        companyId,
        rdxUserId,
        rdxUserName,
        maxResults = 10
    } = input;

    // Validate required inputs
    if (!cookies) {
        throw new Error('❌ Cookies are required. Please provide your Resdex session cookies.');
    }
    if (!requirementId || !companyId || !rdxUserId || !rdxUserName) {
        throw new Error('❌ Missing required fields: requirementId, companyId, rdxUserId, rdxUserName');
    }

    Actor.log.info('✅ Input validated, calling n8n webhook...', { 
        requirementId, 
        companyId, 
        rdxUserId,
        maxResults 
    });

    // Call your n8n webhook with the inputs
    const response = await axios.post(
        CONFIG.n8nWebhookUrl,
        {
            cookies,
            requirementId,
            companyId,
            rdxUserId,
            rdxUserName,
            maxResults
        },
        {
            headers: {
                'Content-Type': 'application/json',
                // Optional: Add authentication header if you secure your webhook
                ...(CONFIG.webhookSecret && {
                    'Authorization': `Bearer ${CONFIG.webhookSecret}`
                })
            },
            // Set a longer timeout since n8n might take time to process
            timeout: 300000 // 5 minutes
        }
    );

    Actor.log.info('✅ n8n workflow completed successfully');

    // n8n returns the processed data
    const results = response.data;

    // If n8n returns an array of profiles, push each to dataset
    if (Array.isArray(results)) {
        Actor.log.info(`📊 Processing ${results.length} results from n8n`);
        
        for (const profile of results) {
            await Actor.pushData(profile);
        }

        await Actor.setValue('OUTPUT', {
            success: true,
            totalProfiles: results.length,
            profiles: results
        });
    } 
    // If n8n returns a single object
    else if (results && typeof results === 'object') {
        Actor.log.info('📊 Processing results from n8n');
        
        // If results has a profiles array
        if (results.profiles && Array.isArray(results.profiles)) {
            for (const profile of results.profiles) {
                await Actor.pushData(profile);
            }
        } else {
            // Otherwise push the entire result
            await Actor.pushData(results);
        }

        await Actor.setValue('OUTPUT', results);
    } 
    // Unknown format
    else {
        Actor.log.warning('⚠️ Unexpected response format from n8n');
        await Actor.setValue('OUTPUT', {
            success: true,
            data: results
        });
    }

    Actor.log.info('🎉 Actor completed successfully');

} catch (error) {
    Actor.log.error('💥 Actor failed with error:', {
        message: error.message,
        details: error.response?.data || error.stack
    });
    
    await Actor.setValue('OUTPUT', {
        success: false,
        error: error.message,
        details: error.response?.data
    });
    
    throw error;
}

await Actor.exit();
