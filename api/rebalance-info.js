const { getRebalanceDates } = require('../sp500-symbols');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { lastRebalance, nextRebalance } = getRebalanceDates();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate days since last rebalance
    const daysSinceLast = Math.floor((today - lastRebalance) / (1000 * 60 * 60 * 24));
    
    // Calculate days until next rebalance
    const daysUntilNext = Math.floor((nextRebalance - today) / (1000 * 60 * 60 * 24));
    
    // Format dates
    const formatDate = (date) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
      return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };
    
    const response = {
      lastRebalanceDate: lastRebalance.toISOString(),
      lastRebalanceDateFormatted: formatDate(lastRebalance),
      daysSinceLastRebalance: daysSinceLast,
      nextRebalanceDate: nextRebalance.toISOString(),
      nextRebalanceDateFormatted: formatDate(nextRebalance),
      daysUntilNextRebalance: daysUntilNext
    };
    
    // Add note for June 2025 exception
    if (nextRebalance.getFullYear() === 2025 && nextRebalance.getMonth() === 5 && nextRebalance.getDate() === 6) {
      response.note = "June 2025 rebalance occurred on June 6 (first Friday) instead of the usual third Friday";
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in rebalance info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};