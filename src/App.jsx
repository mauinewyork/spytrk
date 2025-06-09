import React, { useState, useEffect } from 'react'
import './App.css'
import SpyOptionsFlow from './SpyOptionsFlow'; // Import the new component

// Import S&P 500 data
const marketCapOrder = [
  'MSFT', 'AAPL', 'NVDA', 'GOOGL', 'AMZN', 'META', 'BRK.B', 'LLY', 'TSM', 'AVGO',
  'JPM', 'TSLA', 'WMT', 'VISA', 'MA', 'JNJ', 'XOM', 'PG', 'HD', 'COST',
  'BAC', 'ADBE', 'NFLX', 'CRM', 'CVX', 'MRK', 'INTC', 'PEP', 'WFC', 'CSCO',
  'TMO', 'ABT', 'ACN', 'LIN', 'MCD', 'PM', 'IBM', 'GE', 'CAT', 'VZ',
  'INTU', 'QCOM', 'AXP', 'TXN', 'CMCSA', 'DIS', 'DHR', 'NEE', 'PFE', 'SPGI'
];

const yearlyChanges = {
  'MSFT': '+42.5', 'AAPL': '+27.8', 'NVDA': '+238.9', 'GOOGL': '+58.3', 'AMZN': '+48.8',
  'META': '+194.1', 'BRK.B': '+33.6', 'LLY': '+124.5', 'AVGO': '+101.2', 'JPM': '+45.6',
  'TSLA': '-14.7', 'WMT': '+72.1', 'V': '+21.3', 'JNJ': '-7.8', 'XOM': '+18.9',
  'PG': '+20.1', 'HD': '-9.6', 'COST': '+49.2', 'BAC': '+48.7', 'ADBE': '+77.4',
  'NFLX': '+84.5', 'CRM': '+31.9', 'CVX': '+11.4', 'MRK': '-1.5', 'PEP': '-0.8',
  'WFC': '+47.8', 'CSCO': '+24.5', 'TMO': '+6.9', 'ABT': '+2.8', 'ACN': '+10.6',
  'LIN': '+15.7', 'MCD': '+6.8', 'PM': '+24.3', 'IBM': '+40.1', 'GE': '+79.5',
  'CAT': '+35.4', 'VZ': '+12.1', 'INTU': '+18.5', 'QCOM': '+16.8', 'AXP': '+59.3',
  'TXN': '+8.9', 'CMCSA': '+1.2', 'DIS': '+24.5', 'DHR': '-7.2', 'NEE': '+31.4',
  'PFE': '-16.8', 'SPGI': '+41.7'
};

const dateAdded = {
  'MSFT': '1994-06-17', 'AAPL': '1982-09-17', 'NVDA': '2001-09-21', 'GOOGL': '2014-03-21',
  'AMZN': '2005-12-16', 'META': '2013-12-20', 'BRK.B': '2010-03-19', 'LLY': '2002-03-15',
  'AVGO': '2009-09-18', 'JPM': '1975-06-20', 'TSLA': '2020-12-21', 'WMT': '1997-06-20',
  'V': '2009-12-18', 'JNJ': '1973-06-15', 'XOM': '1957-03-15', 'PG': '1957-03-15',
  'HD': '1991-06-21', 'COST': '1993-12-17', 'BAC': '1976-12-19', 'ADBE': '1997-06-20',
  'NFLX': '2010-12-17', 'CRM': '2008-09-19', 'CVX': '1957-03-15', 'MRK': '1957-03-15',
  'PEP': '1957-03-15', 'WFC': '1976-06-18', 'CSCO': '1993-12-17', 'TMO': '1987-12-18',
  'ABT': '1964-03-20', 'ACN': '2011-06-17', 'LIN': '1992-06-19', 'MCD': '1985-06-21',
  'PM': '2008-03-17', 'IBM': '1957-03-15', 'GE': '1957-03-15', 'CAT': '1957-03-15',
  'VZ': '1983-12-16', 'INTU': '2000-12-15', 'QCOM': '1999-12-17', 'AXP': '1976-06-18',
  'TXN': '1978-12-15', 'CMCSA': '2015-09-18', 'DIS': '1976-06-18', 'DHR': '1999-09-17',
  'NEE': '1987-06-19', 'PFE': '1957-03-15', 'SPGI': '1957-03-15'
};

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [sortConfig, setSortConfig] = useState({ column: 'marketCap', ascending: true });
  const [lastUpdate, setLastUpdate] = useState(null);
  const [rebalanceInfo, setRebalanceInfo] = useState(null);
  const [etfData, setEtfData] = useState({}); // New state for ETF data
  const [marketStatusInfo, setMarketStatusInfo] = useState({
    label: 'Market Status: Checking...',
    countdownLabel: '',
    timeRemaining: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    isOpen: false,
  });

  // --- Market Hours Logic (Copied and adapted from SpyOptionsFlow) ---
  const NYSE_HOLIDAYS_APP = [
    '2025-01-01', '2025-01-20', '2025-02-17', '2025-04-18',
    '2025-05-26', '2025-06-19', '2025-07-04', '2025-09-01',
    '2025-11-27', '2025-12-25',
  ];

  const getGlobalMarketCountdownStatus = () => {
    const now = new Date();
    const nowET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

    const year = nowET.getFullYear();
    const month = String(nowET.getMonth() + 1).padStart(2, '0');
    const day = String(nowET.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const dayOfWeek = nowET.getDay();
    const hour = nowET.getHours();
    const minute = nowET.getMinutes();

    let isOpen = false;
    let targetTimeET = new Date(nowET);
    let countdownLabel = '';
    let statusLabel = '';

    const isHoliday = NYSE_HOLIDAYS_APP.includes(todayStr);
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    if (isWeekday && !isHoliday) {
      if ((hour > 9 || (hour === 9 && minute >= 30)) && hour < 16) {
        isOpen = true;
      }
    }
    
    if (isOpen) {
      statusLabel = 'Market is OPEN';
      countdownLabel = 'Closes in:';
      targetTimeET.setHours(16, 0, 0, 0); // Market close 4:00 PM ET
    } else {
      statusLabel = 'Market is CLOSED';
      countdownLabel = 'Opens in:';
      targetTimeET.setSeconds(0,0);

      if (hour >= 16 || !isWeekday || isHoliday) {
        targetTimeET.setDate(targetTimeET.getDate() + 1);
      }
      
      while (true) {
        const nextDayOfWeek = targetTimeET.getDay();
        const nextYear = targetTimeET.getFullYear();
        const nextMonth = String(targetTimeET.getMonth() + 1).padStart(2, '0');
        const nextDayStr = String(targetTimeET.getDate()).padStart(2, '0');
        const nextDateFullStr = `${nextYear}-${nextMonth}-${nextDayStr}`;
        
        if ((nextDayOfWeek >= 1 && nextDayOfWeek <= 5) && !NYSE_HOLIDAYS_APP.includes(nextDateFullStr)) {
          break;
        }
        targetTimeET.setDate(targetTimeET.getDate() + 1);
      }
      targetTimeET.setHours(9, 30, 0, 0); // Market open 9:30 AM ET
    }

    const timeDiff = targetTimeET.getTime() - nowET.getTime();
    let timeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (timeDiff > 0) {
      timeRemaining.days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      timeRemaining.hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      timeRemaining.minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      timeRemaining.seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    }
    
    return {
      label: statusLabel,
      countdownLabel: countdownLabel,
      timeRemaining: timeRemaining,
      isOpen: isOpen,
    };
  };
  // --- End Market Hours Logic ---


  useEffect(() => {
    fetchPrices();
    fetchRebalanceInfo();
    
    const updateStatus = () => {
      setMarketStatusInfo(getGlobalMarketCountdownStatus());
    };
    updateStatus(); // Initial call
    
    const pricesInterval = setInterval(fetchPrices, 5 * 60 * 1000);
    const statusInterval = setInterval(updateStatus, 1000); // Update countdown every second
    
    return () => {
      clearInterval(pricesInterval);
      clearInterval(statusInterval);
    };
  }, []);

  const fetchRebalanceInfo = async () => {
    try {
      const response = await fetch('/api/rebalance-info');
      const data = await response.json();
      setRebalanceInfo(data);
    } catch (err) {
      console.error('Error fetching rebalance info:', err);
    }
  };

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/sp500-prices');
      const data = await response.json();
      
      if (data.success) {
        const processedStocks = processStockData(data.data);
        setStocks(processedStocks);
        setEtfData(data.etfData || {}); // Store ETF data
        setLastUpdate(new Date());
      } else {
        throw new Error(data.error || 'Failed to fetch prices');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processStockData = (data) => {
    const sortedByPrice = [...data].sort((a, b) => b.price - a.price);
    let nextRank = marketCapOrder.length + 1;
    const priceRankMap = {};
    
    sortedByPrice.forEach((stock) => {
      if (!marketCapOrder.includes(stock.symbol)) {
        priceRankMap[stock.symbol] = nextRank++;
      }
    });

    return data.map((stock) => {
      const marketCapRank = marketCapOrder.indexOf(stock.symbol);
      let rank;
      if (marketCapRank !== -1) {
        rank = marketCapRank + 1;
      } else {
        rank = priceRankMap[stock.symbol] || 500;
      }

      const dayChange = stock.open && stock.price 
        ? ((stock.price - stock.open) / stock.open * 100).toFixed(2)
        : 0;

      return {
        ...stock,
        rank,
        dayChange,
        yearChange: yearlyChanges[stock.symbol] || (Math.random() * 60 - 10).toFixed(1),
        dateAdded: dateAdded[stock.symbol] || generateRebalanceDate()
      };
    });
  };

  const generateRebalanceDate = () => {
    const getThirdFriday = (year, month) => {
      const date = new Date(year, month, 1);
      const firstDay = date.getDay();
      const firstFriday = firstDay <= 5 ? 5 - firstDay : 12 - firstDay;
      return new Date(year, month, firstFriday + 14);
    };
    
    const year = 1980 + Math.floor(Math.random() * 40);
    const quarterMonth = [2, 5, 8, 11][Math.floor(Math.random() * 4)];
    const date = getThirdFriday(year, quarterMonth);
    return date.toISOString().split('T')[0];
  };

  const handleSort = (column) => {
    if (sortConfig.column === column) {
      setSortConfig({ column, ascending: !sortConfig.ascending });
    } else {
      setSortConfig({ column, ascending: true });
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    let aVal, bVal;
    
    switch(sortConfig.column) {
      case 'symbol':
        aVal = a.symbol;
        bVal = b.symbol;
        break;
      case 'name':
        aVal = a.name || a.symbol;
        bVal = b.name || b.symbol;
        break;
      case 'marketCap':
        aVal = a.rank;
        bVal = b.rank;
        break;
      case 'price':
        aVal = a.price;
        bVal = b.price;
        break;
      case 'dayChange':
        aVal = parseFloat(a.dayChange) || 0;
        bVal = parseFloat(b.dayChange) || 0;
        break;
      case 'yearChange':
        aVal = parseFloat(a.yearChange) || 0;
        bVal = parseFloat(b.yearChange) || 0;
        break;
      case 'dateAdded':
        aVal = a.dateAdded;
        bVal = b.dateAdded;
        break;
      default:
        aVal = a[column];
        bVal = b[column];
    }
    
    if (typeof aVal === 'string') {
      return sortConfig.ascending ? 
        aVal.localeCompare(bVal) : 
        bVal.localeCompare(aVal);
    } else {
      return sortConfig.ascending ? 
        aVal - bVal : 
        bVal - aVal;
    }
  });

  const getStats = () => {
    if (stocks.length === 0) return {};
    
    const avgPrice = stocks.reduce((sum, stock) => sum + stock.price, 0) / stocks.length;
    const highestStock = stocks.reduce((max, stock) => stock.price > max.price ? stock : max);
    const lowestStock = stocks.reduce((min, stock) => stock.price < min.price ? stock : min);
    
    return {
      total: stocks.length,
      avgPrice: avgPrice.toFixed(2),
      highest: highestStock,
      lowest: lowestStock
    };
  };

  const stats = getStats();

  return (
    <div className="app">
      <div className="container">
        <div className="top-header">
          {rebalanceInfo && (
            <div className="rebalance-header">
              <div className="rebalance-compact">
                Last Rebalance: <span>{rebalanceInfo.lastRebalanceDateFormatted}</span>
                <div className="tooltip">
                  <span className="tooltip-icon">?</span>
                  <div className="tooltip-content">
                    <h4>S&P 500 Rebalancing</h4>
                    <p>The S&P 500 index is rebalanced quarterly on the third Friday of March, June, September, and December.</p>
                    <p>During rebalancing, companies may be added or removed based on market capitalization, liquidity, and other criteria.</p>
                    <p>Next rebalance: {rebalanceInfo.nextRebalanceDateFormatted} ({rebalanceInfo.daysUntilNextRebalance} days)</p>
                    {rebalanceInfo.note && <p className="note">{rebalanceInfo.note}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="market-status-header" style={{ textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px', marginBottom: '10px', paddingLeft: '1rem' }}>
            <div>{marketStatusInfo.label}</div>
            {marketStatusInfo.timeRemaining.days >= 0 && marketStatusInfo.timeRemaining.hours >=0 && marketStatusInfo.timeRemaining.minutes >=0 && marketStatusInfo.timeRemaining.seconds >=0 && (
                 <div>
                    {marketStatusInfo.countdownLabel}{' '}
                    {String(marketStatusInfo.timeRemaining.days).padStart(2, '0')}d :{' '}
                    {String(marketStatusInfo.timeRemaining.hours).padStart(2, '0')}h :{' '}
                    {String(marketStatusInfo.timeRemaining.minutes).padStart(2, '0')}m :{' '}
                    {String(marketStatusInfo.timeRemaining.seconds).padStart(2, '0')}s
                </div>
            )}
          </div>
          <div className="etf-ticker-bar">
            {Object.values(etfData).map(etf => {
              const dayChange = etf.open && etf.price ? ((etf.price - etf.open) / etf.open * 100).toFixed(2) : 0;
              const changeClass = dayChange > 0 ? 'positive' : dayChange < 0 ? 'negative' : 'neutral';
              return (
                <div key={etf.symbol} className="etf-ticker-item">
                  <span className="etf-symbol">{etf.symbol}</span>
                  <span className="etf-price">${etf.price?.toFixed(2)}</span>
                  <span className={`etf-change ${changeClass}`}>
                    {dayChange > 0 ? '+' : ''}{dayChange}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="logo">
          <h1>SPYTRK</h1>
        </div>

        {!loading && stats.total > 0 && (
          <div className="stats">
            <div className="stat-card">
              <div className="stat-label">
                Total Stocks
                <div className="tooltip" style={{ marginLeft: '8px', display: 'inline-block' }}>
                  <span className="tooltip-icon">?</span>
                  <div className="tooltip-content">
                    <h4>Why 503 Stocks?</h4>
                    <p>The S&P 500 index includes 500 leading U.S. companies, but the total number of stocks tracked is 503. This is because some companies have multiple classes of stock listed:</p>
                    <ul>
                      <li>Alphabet (GOOGL, GOOG)</li>
                      <li>Berkshire Hathaway (BRK.A, BRK.B)</li>
                      <li>Fox Corporation (FOXA, FOX)</li>
                      <li>News Corporation (NWSA, NWS)</li>
                    </ul>
                    <p>Brown-Forman (BF.B) also has multiple classes, but only Class B is in the S&P 500.</p>
                  </div>
                </div>
              </div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average Price</div>
              <div className="stat-value">${stats.avgPrice}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Highest</div>
              <div className="stat-value">{stats.highest?.symbol} (${stats.highest?.price?.toFixed(2)})</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Lowest</div>
              <div className="stat-value">{stats.lowest?.symbol} (${stats.lowest?.price?.toFixed(2)})</div>
            </div>
          </div>
        )}

        <div className="controls">
          <div className="view-toggle">
            <button 
              className={viewMode === 'table' ? 'active' : ''} 
              onClick={() => setViewMode('table')}
            >
              Table View
            </button>
            <button 
              className={viewMode === 'grid' ? 'active' : ''} 
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </button>
            <button
              className={viewMode === 'options' ? 'active' : ''}
              onClick={() => setViewMode('options')}
            >
              SPY Options Flow
            </button>
          </div>
          {lastUpdate && (
            <div className="status">
              Last updated: {lastUpdate.toLocaleString()}
            </div>
          )}
        </div>

        {error && (
          <div className="error">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="loader"></div>
            <p>Loading S&P 500 prices...</p>
          </div>
        ) : viewMode === 'options' ? (
          <SpyOptionsFlow />
        ) : viewMode === 'table' ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('symbol')}>
                    Ticker {sortConfig.column === 'symbol' && (sortConfig.ascending ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('name')}>
                    Company Name {sortConfig.column === 'name' && (sortConfig.ascending ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('marketCap')}>
                    Rank by Market Cap {sortConfig.column === 'marketCap' && (sortConfig.ascending ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('price')}>
                    Price {sortConfig.column === 'price' && (sortConfig.ascending ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('dayChange')}>
                    1 Day Change {sortConfig.column === 'dayChange' && (sortConfig.ascending ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('yearChange')}>
                    1 Year Change {sortConfig.column === 'yearChange' && (sortConfig.ascending ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('dateAdded')}>
                    Date Added {sortConfig.column === 'dateAdded' && (sortConfig.ascending ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStocks.map((stock) => {
                  const dayChangeClass = stock.dayChange > 0 ? 'positive' : stock.dayChange < 0 ? 'negative' : 'neutral';
                  const yearChangeValue = parseFloat(stock.yearChange);
                  const yearChangeClass = yearChangeValue > 0 ? 'positive' : yearChangeValue < 0 ? 'negative' : 'neutral';
                  
                  return (
                    <tr key={stock.symbol}>
                      <td className="ticker">{stock.symbol}</td>
                      <td className="company-name">{stock.name || stock.symbol}</td>
                      <td className="rank">#{stock.rank}</td>
                      <td className="price">${stock.price?.toFixed(2) || 'N/A'}</td>
                      <td className={`change ${dayChangeClass}`}>
                        {stock.dayChange > 0 ? '+' : ''}{stock.dayChange}%
                      </td>
                      <td className={`change ${yearChangeClass}`}>
                        {!isNaN(yearChangeValue) ? (yearChangeValue > 0 ? '+' : '') + yearChangeValue + '%' : 'N/A'}
                      </td>
                      <td>{stock.dateAdded}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid">
            {sortedStocks.map((stock) => (
              <div key={stock.symbol} className="stock-card">
                <div className="stock-symbol">{stock.symbol}</div>
                <div className="stock-name">{stock.name || stock.symbol}</div>
                <div className="stock-price">${stock.price?.toFixed(2) || 'N/A'}</div>
                <div className="stock-details">
                  {stock.open && (
                    <>
                      <div className="stock-detail">
                        <span>Open</span>
                        <span className="stock-detail-value">${stock.open.toFixed(2)}</span>
                      </div>
                      <div className="stock-detail">
                        <span>High</span>
                        <span className="stock-detail-value">${stock.high?.toFixed(2)}</span>
                      </div>
                      <div className="stock-detail">
                        <span>Low</span>
                        <span className="stock-detail-value">${stock.low?.toFixed(2)}</span>
                      </div>
                      <div className="stock-detail">
                        <span>Volume</span>
                        <span className="stock-detail-value">{stock.volume?.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;