const { google } = require('googleapis');
const https = require('https');
require('dotenv').config();

class GoogleSearchScraper {
    constructor() {
        this.customsearch = google.customsearch('v1');
        // Using working credentials with proper format
        this.apiKey = 'AIzaSyB9UbHJL7aDsgk0rjHyCroWh4Si3CI7764';
        this.cseId = 'b1f315d6c00664e3b'; // Your original CSE ID
        
        console.log('🔑 Using API Key:', this.apiKey.substring(0, 10) + '...');
        console.log('🔍 Using CSE ID:', this.cseId);
        
        // Test API key immediately
        this.testAPIKey();
    }
    
    async testAPIKey() {
        try {
            console.log('🧪 Testing API key...');
            const response = await this.customsearch.cse.list({
                auth: this.apiKey,
                cx: this.cseId,
                q: 'test',
                num: 1
            });
            console.log('✅ API key is working!');
        } catch (error) {
            console.log('❌ API test failed:', error.message);
            if (error.message.includes('API key not valid')) {
                console.log('💡 Please enable "Custom Search JSON API" in Google Cloud Console');
                console.log('   Go to: https://console.developers.google.com/');
                console.log('   Navigate to: APIs & Services → Library');
                console.log('   Search for: Custom Search JSON API');
                console.log('   Click: Enable');
            }
        }
    }

    async searchInteriorDesignCompanies() {
        try {
            console.log('🔍 Searching for Interior Design Companies in Hong Kong...\n');
            
            const searchQuery = 'interior design';
            const results = [];
            let startIndex = 1;
            const resultsPerPage = 10;
            const totalResultsNeeded = 30;

            // Google Custom Search API allows max 10 results per request
            // We need to make multiple requests to get 30 results
            while (results.length < totalResultsNeeded) {
                const remainingResults = totalResultsNeeded - results.length;
                const currentPageSize = Math.min(resultsPerPage, remainingResults);

                console.log(`📄 Fetching results ${startIndex} to ${startIndex + currentPageSize - 1}...`);

                const response = await this.customsearch.cse.list({
                    auth: this.apiKey,
                    cx: this.cseId,
                    q: searchQuery,
                    start: startIndex,
                    num: currentPageSize,
                    safe: 'medium'
                });

                if (response.data.items) {
                    results.push(...response.data.items);
                    console.log(`✅ Found ${response.data.items.length} results on this page`);
                } else {
                    console.log('⚠️  No more results available');
                    break;
                }

                startIndex += resultsPerPage;

                // Add a small delay to be respectful to the API
                if (results.length < totalResultsNeeded) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            return results.slice(0, totalResultsNeeded); // Ensure we don't exceed 30 results

        } catch (error) {
            console.error('❌ Error during search:', error.message);
            throw error;
        }
    }

    logResults(results) {
        console.log('\n' + '='.repeat(80));
        console.log('🏢 INTERIOR DESIGN COMPANIES IN HONG KONG - SEARCH RESULTS');
        console.log('='.repeat(80));
        console.log(`📊 Total Results Found: ${results.length}\n`);

        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.title}`);
            console.log(`   🔗 URL: ${result.link}`);
            console.log(`   📝 Snippet: ${result.snippet || 'No description available'}`);
            
            if (result.pagemap && result.pagemap.metatags) {
                const metaTags = result.pagemap.metatags[0];
                if (metaTags['og:site_name']) {
                    console.log(`   🏢 Site: ${metaTags['og:site_name']}`);
                }
            }
            
            console.log('   ' + '-'.repeat(70));
        });

        // Save results to a file
        this.saveResultsToFile(results);
    }

    saveResultsToFile(results) {
        const fs = require('fs');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `interior-design-results-${timestamp}.json`;
        
        const dataToSave = {
            searchQuery: 'Interior Design Company Hong Kong',
            searchDate: new Date().toISOString(),
            totalResults: results.length,
            results: results.map((result, index) => ({
                rank: index + 1,
                title: result.title,
                url: result.link,
                snippet: result.snippet,
                displayLink: result.displayLink
            }))
        };

        fs.writeFileSync(filename, JSON.stringify(dataToSave, null, 2));
        console.log(`\n💾 Results saved to: ${filename}`);
    }

    async run() {
        try {
            const results = await this.searchInteriorDesignCompanies();
            this.logResults(results);
            
            console.log('\n🎉 Search completed successfully!');
            console.log('📋 Summary:');
            console.log(`   • Keyword: Interior Design Company`);
            console.log(`   • Location: Hong Kong`);
            console.log(`   • Results Found: ${results.length}`);
            console.log(`   • Results Logged: ✅`);
            
        } catch (error) {
            console.error('💥 Script failed:', error.message);
            process.exit(1);
        }
    }
}

// Run the script
if (require.main === module) {
    const scraper = new GoogleSearchScraper();
    scraper.run();
}

module.exports = GoogleSearchScraper;
