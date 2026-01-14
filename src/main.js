import { Actor } from 'apify';
import axios from 'axios';

// CONFIGURATION - Update your n8n webhook URL here
const CONFIG = {
    n8nWebhookUrl: 'https://n8n.grrbaow.com/webhook/naukri-scrapper',
    webhookSecret: process.env.N8N_WEBHOOK_SECRET || null
};

await Actor.init();

try {
    // ========== START ==========
    console.log('='.repeat(60));
    console.log('🚀 NAUKRI CV SCRAPER STARTED');
    console.log('='.repeat(60));

    // Get input from user
    const input = await Actor.getInput();
    const { curlCommand, maxResults = 10 } = input;

    // Validate required inputs
    if (!curlCommand) {
        throw new Error('❌ cURL command is required. Please provide the complete cURL command from Chrome DevTools.');
    }

    console.log(`📊 Requested profiles: ${maxResults}`);
    console.log(`🌐 n8n webhook: ${CONFIG.n8nWebhookUrl}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('');
    console.log('📡 Calling n8n workflow...');

    const startTime = Date.now();

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
            timeout: 6000000 // 10min (for 1000 results)
        }
    );

    console.log('✅ n8n workflow completed successfully');
    console.log('');

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

    // n8n returns the processed data
    const results = response.data;
    let actualCount = 0;
    let processedData = null;

    // Check if we have candidates array (this is what n8n returns)
    if (results.candidates && Array.isArray(results.candidates)) {
        actualCount = results.candidates.length;
        console.log(`📊 Processing ${actualCount} candidates from n8n`);

        for (const candidate of results.candidates) {
            await Actor.pushData(candidate);
        }

        processedData = {
            success: true,
            totalCandidates: results.totalCandidates,
            scrapedAt: results.scrapedAt,
            candidates: results.candidates
        };

        await Actor.setValue('OUTPUT', processedData);
    }
    // If results is an array directly
    else if (Array.isArray(results)) {
        actualCount = results.length;
        console.log(`📊 Processing ${actualCount} results from n8n`);

        for (const profile of results) {
            await Actor.pushData(profile);
        }

        processedData = {
            success: true,
            totalProfiles: results.length,
            profiles: results
        };

        await Actor.setValue('OUTPUT', processedData);
    }
    // If results is a single object
    else if (results && typeof results === 'object') {
        actualCount = 1;
        console.log('📊 Processing single result from n8n');
        await Actor.pushData(results);
        await Actor.setValue('OUTPUT', results);
        processedData = results;
    }
    // Unknown format
    else {
        console.warn('⚠️ Unexpected response format from n8n');
        await Actor.setValue('OUTPUT', {
            success: true,
            data: results
        });
        processedData = { success: true, data: results };
    }

    // ========== RESULTS ANALYSIS ==========
    console.log('');
    console.log('='.repeat(60));
    console.log('📈 SCRAPING RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Profiles received: ${actualCount}`);
    console.log(`🎯 Profiles requested: ${maxResults}`);
    console.log(`⏱️  Time taken: ${elapsedTime}s`);
    console.log('');

    // ========== QUOTA/LIMIT DETECTION ==========
    const shortfall = maxResults - actualCount;

    if (shortfall > 0 && actualCount > 0) {
        const percentageGot = ((actualCount / maxResults) * 100).toFixed(1);

        console.log('⚠️  ATTENTION: Did not get all requested profiles');
        console.log('─'.repeat(60));
        console.log(`   Missing: ${shortfall} profiles (got ${percentageGot}%)`);
        console.log('');
        console.log('💡 Possible reasons:');

        // Detect specific quota patterns
        if (actualCount % 50 === 0) {
            // Got exact multiples of 50 (page size)
            const pagesGot = actualCount / 50;
            const pagesRequested = Math.ceil(maxResults / 50);
            console.log(`   📄 Got ${pagesGot} pages out of ${pagesRequested} requested pages`);
            console.log('      • Naukri CV viewing quota exhausted');
            console.log('      • Daily/monthly limit reached');
            console.log('      • Check your Naukri Resdex dashboard for quota status');
        } else if (actualCount < 100) {
            console.log('   ⚠️  Low profile count - Likely causes:');
            console.log('      • Naukri CV quota nearly exhausted');
            console.log('      • CAPTCHA triggered (reduce scraping speed in n8n)');
            console.log('      • Session expired midway');
        } else {
            console.log('   📊 Partial success - Possible causes:');
            console.log('      • CV viewing quota ran out partway through');
            console.log('      • CAPTCHA triggered after viewing many profiles');
            console.log('      • Session timeout or network issues');
        }

        console.log('');
        console.log('🔧 Recommended actions:');
        console.log('   1. Login to Naukri Resdex and check CV viewing quota');
        console.log('   2. Wait for quota reset (check daily/monthly limits)');
        console.log('   3. Get fresh cookies (new cURL command from Chrome DevTools)');
        console.log('   4. Reduce maxResults to match available quota');
        console.log('   5. If needed, contact Naukri support to purchase more CV credits');
        console.log('');

        // Save warning metadata
        await Actor.setValue('QUOTA_WARNING', {
            requested: maxResults,
            received: actualCount,
            shortfall: shortfall,
            percentageReceived: percentageGot,
            likelyQuotaIssue: actualCount % 50 === 0,
            pagesReceived: Math.floor(actualCount / 50),
            pagesRequested: Math.ceil(maxResults / 50),
            timestamp: new Date().toISOString()
        });

    } else if (actualCount === 0) {
        console.log('❌ CRITICAL: No profiles scraped!');
        console.log('─'.repeat(60));
        console.log('💡 Likely causes:');
        console.log('   ❌ Cookies expired - Get fresh cURL from Chrome DevTools');
        console.log('   ❌ Account quota fully exhausted - Check Naukri dashboard');
        console.log('   ❌ Invalid search parameters in n8n workflow');
        console.log('   ❌ Network/authentication issues');
        console.log('');
        console.log('🔧 Immediate actions:');
        console.log('   1. Open Naukri Resdex in Chrome incognito mode');
        console.log('   2. Perform a search');
        console.log('   3. Copy fresh cURL command from Network tab');
        console.log('   4. Check Naukri account quota status');
        console.log('');

        // Save error metadata
        await Actor.setValue('ERROR_INFO', {
            error: 'No profiles scraped',
            requested: maxResults,
            received: 0,
            timestamp: new Date().toISOString(),
            possibleReasons: [
                'Cookies expired',
                'Quota exhausted',
                'Invalid search parameters',
                'Authentication failed'
            ]
        });

    } else {
        console.log('✅ SUCCESS: Got all requested profiles!');
        console.log('');
    }

    // ========== SAVE STATS ==========
    await Actor.setValue('SCRAPING_STATS', {
        requested: maxResults,
        received: actualCount,
        shortfall: shortfall,
        successRate: `${((actualCount / maxResults) * 100).toFixed(1)}%`,
        timeTakenSeconds: parseFloat(elapsedTime),
        timestamp: new Date().toISOString(),
        quotaExhausted: shortfall > 0,
        likelyQuotaIssue: actualCount % 50 === 0 && actualCount < maxResults
    });

    // ========== FINAL SUMMARY ==========
    console.log('='.repeat(60));
    console.log('🎉 SCRAPING COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Total profiles saved: ${actualCount}`);
    console.log(`📊 Success rate: ${((actualCount / maxResults) * 100).toFixed(1)}%`);
    console.log(`⏱️  Total time: ${elapsedTime}s`);

    if (shortfall > 0) {
        console.log('');
        console.log('⚠️  NOTE: Partial results (see quota details above)');
    }

    console.log('');
    console.log('✅ Actor finished successfully');
    console.log('='.repeat(60));

} catch (error) {
    // ========== ERROR HANDLING ==========
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ SCRAPING FAILED');
    console.error('='.repeat(60));
    console.error(`❌ Error: ${error.message}`);

    // Provide detailed error info
    if (error.response?.data) {
        console.error('');
        console.error('📋 Error details from n8n:');
        console.error(JSON.stringify(error.response.data, null, 2));
    }

    console.error('');

    // Provide specific guidance based on error type
    if (error.message.includes('cURL command is required')) {
        console.error('💡 Fix: Provide curlCommand in actor input');
    } else if (error.code === 'ECONNREFUSED') {
        console.error('💡 Fix: n8n webhook is not accessible');
        console.error('   • Check n8n is running');
        console.error('   • Verify webhook URL is correct');
    } else if (error.code === 'ETIMEDOUT') {
        console.error('💡 Fix: Request timed out');
        console.error('   • Reduce maxResults');
        console.error('   • Check n8n workflow performance');
        console.error('   • Increase timeout if needed');
    } else if (error.response?.status === 403 || error.response?.status === 401) {
        console.error('💡 Fix: Authentication failed');
        console.error('   • Get fresh cURL command with valid cookies');
        console.error('   • Check Naukri login session is active');
    } else if (error.response?.status === 500) {
        console.error('💡 Fix: n8n workflow error');
        console.error('   • Check n8n workflow logs for details');
        console.error('   • Verify workflow configuration');
        console.error('   • Test with smaller maxResults first');
    } else {
        console.error('💡 Fix: Check error details above');
        console.error('   • Review n8n workflow logs');
        console.error('   • Verify all configurations');
        console.error('   • Test with curl command manually');
    }

    console.error('');
    console.error('='.repeat(60));

    // Save error log
    await Actor.setValue('OUTPUT', {
        success: false,
        error: error.message,
        details: error.response?.data,
        timestamp: new Date().toISOString()
    });

    await Actor.setValue('ERROR_LOG', {
        error: error.message,
        stack: error.stack,
        response: error.response?.data,
        code: error.code,
        status: error.response?.status,
        timestamp: new Date().toISOString()
    });

    throw error;
}

await Actor.exit();
