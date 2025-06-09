# SPYTRK - S&P 500 Price Tracker

A real-time S&P 500 stock price tracker with a vaporwave-inspired design, built with React and powered by Alpaca Markets API.

![SPYTRK](https://img.shields.io/badge/SPYTRK-S%26P%20500%20Tracker-ff006e?style=for-the-badge&labelColor=0a0a0a)

## Features

- 🎨 **Vaporwave Aesthetic** - Inspired by retro-futuristic design with glowing effects
- 📊 **Real-time Stock Prices** - Live data for all 503 S&P 500 companies
- 🏢 **Company Names** - Full company names displayed alongside ticker symbols
- 📈 **Market Cap Rankings** - Accurate ranking by market capitalization
- 📉 **Price Changes** - 1-day and 1-year percentage changes with color coding
- 🗓️ **Rebalance Tracking** - Shows S&P 500 quarterly rebalance dates
- 🔄 **Auto-refresh** - Updates every 5 minutes automatically
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 📊 **Dual Views** - Toggle between table and grid layouts
- 📈 **Vercel Analytics** - Built-in analytics and performance tracking

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Custom CSS with vaporwave theme
- **Backend**: Node.js with Express (for local development)
- **API**: Alpaca Markets API
- **Deployment**: Vercel with serverless functions
- **Analytics**: Vercel Analytics

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/mauinewyork/spytrk.git
cd spytrk
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Alpaca API credentials:
```env
ALPACA_API_KEY=your_api_key_here
ALPACA_API_SECRET=your_api_secret_here
```

4. Run the development server:
```bash
# Start the backend API server
npm run server

# In another terminal, start the React dev server
npm run dev
```

5. Open http://localhost:5173 in your browser

## Deployment

This project is configured for deployment on Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## API Endpoints

- `/api/sp500-prices` - Get current prices for all S&P 500 stocks
- `/api/rebalance-info` - Get S&P 500 rebalance date information

## Design

The SPYTRK interface features:
- Glowing neon text effects
- Gradient backgrounds
- Animated hover states
- Retro-futuristic typography (Orbitron & Space Mono fonts)
- Dark theme with accent colors

## License

MIT

## Credits

- Stock data provided by [Alpaca Markets](https://alpaca.markets/)
- S&P 500 constituent data from public sources
- Design inspired by vaporwave aesthetics