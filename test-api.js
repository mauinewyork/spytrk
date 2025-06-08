const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing S&P 500 API...');
    const response = await axios.get('http://localhost:3000/api/sp500-prices');
    
    // Check first 5 stocks
    console.log('\nFirst 5 stocks:');
    response.data.data.slice(0, 5).forEach(stock => {
      console.log(`${stock.symbol}: ${stock.name || 'NO NAME'} - $${stock.price}`);
    });
    
    console.log(`\nTotal stocks: ${response.data.count}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();