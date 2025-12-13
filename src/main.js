import { Actor } from 'apify';
import axios from 'axios';

// CONFIGURATION - Update your n8n webhook URL here
const CONFIG = {
    n8nWebhookUrl: 'https://n8n.srv936319.hstgr.cloud/webhook/naukri-scrapper',
    webhookSecret: process.env.N8N_WEBHOOK_SECRET || null
};

await Actor.init();

try {
    console.log('🚀 Naukri CV Scraper - Calling n8n workflow');
    
    // Get input from user
    const input = await Actor.getInput();
    const { curlCommand, maxResults = 10 } = input;

    // Validate required inputs
    if (!curlCommand) {
        throw new Error('❌ cURL command is required. Please provide the complete cURL command from Chrome DevTools.');
    }

    console.log('✅ Input validated, calling n8n webhook...');

    // Call your n8n webhook with the cURL command
    const response = await axios.post(
        CONFIG.n8nWebhookUrl,
        {
            curlCommand,
            maxResults
        },
        {
            headers: {
                'Content-Type': 'application/json',
                ...(CONFIG.webhookSecret && {
                    'Authorization': `Bearer ${CONFIG.webhookSecret}`
                })
            },
            timeout: 300000 // 5 minutes
        }
    );

    console.log('✅ n8n workflow completed successfully');

    // n8n returns the processed data
    const results = response.data;

    // Check if we have candidates array (this is what n8n returns)
    if (results.candidates && Array.isArray(results.candidates)) {
        console.log(`📊 Processing ${results.candidates.length} candidates from n8n`);
        
        for (const candidate of results.candidates) {
            await Actor.pushData(candidate);
        }
        
        await Actor.setValue('OUTPUT', {
            success: true,
            totalCandidates: results.totalCandidates,
            scrapedAt: results.scrapedAt,
            candidates: results.candidates
        });
        
        console.log(`🎉 Successfully scraped ${results.totalCandidates} candidates`);
    } 
    // If results is an array directly
    else if (Array.isArray(results)) {
        console.log(`📊 Processing ${results.length} results from n8n`);
        
        for (const profile of results) {
            await Actor.pushData(profile);
        }
        
        await Actor.setValue('OUTPUT', {
            success: true,
            totalProfiles: results.length,
            profiles: results
        });
    } 
    // If results is a single object
    else if (results && typeof results === 'object') {
        console.log('📊 Processing single result from n8n');
        await Actor.pushData(results);
        await Actor.setValue('OUTPUT', results);
    } 
    // Unknown format
    else {
        console.warn('⚠️ Unexpected response format from n8n');
        await Actor.setValue('OUTPUT', {
            success: true,
            data: results
        });
    }

    console.log('🎉 Actor completed successfully');

} catch (error) {
    console.error('💥 Actor failed with error:', {
        message: error.message,
        details: error.response?.data
    });
    
    await Actor.setValue('OUTPUT', {
        success: false,
        error: error.message,
        details: error.response?.data
    });
    
    throw error;
}

await Actor.exit();
