#!/usr/bin/env node

/**
 * Index file for Interior Design Company Search
 * This file serves as the main entry point for the application
 */

const GoogleSearchScraper = require('./search.js');

// Run the search when this file is executed directly
if (require.main === module) {
    console.log('🚀 Starting Interior Design Company Search...\n');
    
    try {
        const scraper = new GoogleSearchScraper();
        scraper.run();
    } catch (error) {
        console.error('❌ Failed to start search:', error.message);
        console.log('\n💡 Make sure you have:');
        console.log('   1. Created a .env file with your API credentials');
        console.log('   2. Installed dependencies with: npm install');
        console.log('   3. Set up Google API key and Custom Search Engine ID');
        console.log('\n📚 See docs/API_SETUP_GUIDE.md for detailed setup instructions');
        process.exit(1);
    }
}

module.exports = GoogleSearchScraper;
