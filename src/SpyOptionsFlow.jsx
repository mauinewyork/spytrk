import React, { useState, useEffect, useCallback } from 'react';

// --- Market Hours Logic (NYSE, Eastern Time) ---
const NYSE_HOLIDAYS = [ // YYYY-MM-DD format
  '2025-01-01', // New Year's Day
  '2025-01-20', // Martin Luther King, Jr. Day
  '2025-02-17', // Washington's Birthday
  '2025-04-18', // Good Friday
  '2025-05-26', // Memorial Day
  '2025-06-19', // Juneteenth National Independence Day
  '2025-07-04', // Independence Day
  '2025-09-01', // Labor Day
  '2025-11-27', // Thanksgiving Day
  '2025-12-25', // Christmas Day
  // Add more holidays as needed for future years
];

const getMarketStatus = () => {
  const now = new Date();
  const nowET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

  const year = nowET.getFullYear();
  const month = String(nowET.getMonth() + 1).padStart(2, '0');
  const day = String(nowET.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const dayOfWeek = nowET.getDay(); // 0 (Sun) to 6 (Sat)
  const hour = nowET.getHours();
  const minute = nowET.getMinutes();

  let isOpen = false;
  let nextOpenTime = new Date(nowET); // Start with current ET time
  nextOpenTime.setSeconds(0, 0);    // Reset seconds and ms

  const isHoliday = NYSE_HOLIDAYS.includes(todayStr);
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // Mon-Fri

  if (isWeekday && !isHoliday) {
    if (hour > 9 || (hour === 9 && minute >= 30)) { // Market opens 9:30 AM ET
      if (hour < 16) { // Market closes 4:00 PM ET
        isOpen = true;
      }
    }
  }

  if (!isOpen) {
    // Calculate next open time
    if (hour >= 16 || !isWeekday || isHoliday) { // If past close, or weekend/holiday
      nextOpenTime.setDate(nextOpenTime.getDate() + 1); // Move to next day
    }
    
    while (true) {
      const nextDayOfWeek = nextOpenTime.getDay();
      const nextYear = nextOpenTime.getFullYear();
      const nextMonth = String(nextOpenTime.getMonth() + 1).padStart(2, '0');
      const nextDay = String(nextOpenTime.getDate()).padStart(2, '0');
      const nextDateStr = `${nextYear}-${nextMonth}-${nextDay}`;
      
      if ((nextDayOfWeek >= 1 && nextDayOfWeek <= 5) && !NYSE_HOLIDAYS.includes(nextDateStr)) {
        break; // Found a valid trading day
      }
      nextOpenTime.setDate(nextOpenTime.getDate() + 1);
    }
    nextOpenTime.setHours(9, 30, 0, 0); // Set to 9:30 AM ET
  } else {
    // If open, next "open" for countdown purposes could be considered start of next day
    // Or simply not show countdown. For now, let's make nextOpenTime for an open market far in future.
     nextOpenTime = new Date(nowET);
     nextOpenTime.setDate(nextOpenTime.getDate() + 7); // Arbitrary future date if market is open
  }
  
  const timeDiff = nextOpenTime.getTime() - nowET.getTime();
  let timeToOpen = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  if (timeDiff > 0 && !isOpen) {
    timeToOpen.days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    timeToOpen.hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    timeToOpen.minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    timeToOpen.seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  }

  return {
    isOpen,
    nextOpenTimeET: nextOpenTime, // This is in ET
    timeToOpen
  };
};


const SpyOptionsFlow = () => {
  const [marketStatus, setMarketStatus] = useState(getMarketStatus());

  const updateMarketStatus = useCallback(() => {
    setMarketStatus(getMarketStatus());
  }, []);

  useEffect(() => {
    // Initial check
    updateMarketStatus();
    
    // Set up interval to update countdown and check market status
    const intervalId = setInterval(() => {
      updateMarketStatus();
    }, 1000); // Update every second for countdown

    return () => clearInterval(intervalId);
  }, [updateMarketStatus]);


  // Vaporwave Styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 200px)', // Adjust based on your header/footer
    padding: '20px',
    fontFamily: "'Orbitron', sans-serif", // Retro-futuristic font
    background: 'linear-gradient(45deg, #1e0034, #000c2e)', // Dark purple/blue gradient
    color: '#00ffcc', // Neon cyan text
    textShadow: '0 0 5px #00ffcc, 0 0 10px #00ffcc, 0 0 15px #ff00ff, 0 0 20px #ff00ff', // Neon glow
  };

  const titleStyle = {
    fontSize: '3rem',
    marginBottom: '20px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  };

  const countdownStyle = {
    fontSize: '2rem',
    letterSpacing: '0.05em',
  };
   const countdownNumberStyle = {
    color: '#ff00ff', // Neon pink for numbers
    margin: '0 5px',
  };


  if (marketStatus.isOpen) {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>Market is OPEN</h1>
        <p>Options data would be displayed here.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Market is CLOSED</h1>
      <p>Next Market Open (ET): {marketStatus.nextOpenTimeET.toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
      <div style={countdownStyle}>
        <span>Opens in: </span>
        <span style={countdownNumberStyle}>{String(marketStatus.timeToOpen.days).padStart(2, '0')}</span>d :&nbsp;
        <span style={countdownNumberStyle}>{String(marketStatus.timeToOpen.hours).padStart(2, '0')}</span>h :&nbsp;
        <span style={countdownNumberStyle}>{String(marketStatus.timeToOpen.minutes).padStart(2, '0')}</span>m :&nbsp;
        <span style={countdownNumberStyle}>{String(marketStatus.timeToOpen.seconds).padStart(2, '0')}</span>s
      </div>
      <p style={{ marginTop: '30px', fontSize: '0.8rem', opacity: 0.7 }}>
        Check back for 0DTE SPY options flow when the market is live.
      </p>
    </div>
  );
};

export default SpyOptionsFlow;