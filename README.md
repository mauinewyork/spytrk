# S&P 500 Price Tracker

A Node.js Express application that fetches real-time stock prices for all S&P 500 companies using the Alpaca Markets API.

## Features

- Fetch current prices for all 500 S&P 500 companies
- Get individual stock prices by symbol
- Batch fetch prices for custom symbol lists
- Web interface with search and sort functionality
- Auto-refresh every 5 minutes
- Clean, responsive UI

## Prerequisites

- Node.js (v14 or higher)
- Alpaca Markets API credentials (free at https://alpaca.markets/)

## Installation

1. Clone or navigate to this directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your Alpaca API credentials in the `.env` file:
   ```
   ALPACA_API_KEY=your_api_key_here
   ALPACA_API_SECRET=your_api_secret_here
   ALPACA_BASE_URL=https://paper-api.alpaca.markets
   ```
   
   Note: Use `https://paper-api.alpaca.markets` for paper trading (testing) or `https://api.alpaca.markets` for live trading data.

## Running the Application

Start the server:
```bash
node server.js
```

The server will start on port 3000 (or the port specified in your .env file).

## API Endpoints

- `GET /` - API documentation
- `GET /api/sp500-prices` - Get all S&P 500 stock prices
- `GET /api/price/:symbol` - Get price for a specific symbol
- `POST /api/prices` - Get prices for multiple symbols
  - Body: `{ "symbols": ["AAPL", "MSFT", "GOOGL"] }`
- `GET /health` - Health check endpoint

## Web Interface

Open your browser and navigate to:
```
http://localhost:3000
```

The web interface provides:
- Real-time display of all S&P 500 stock prices
- Search functionality to filter stocks by symbol
- Sort by symbol or price
- Auto-refresh every 5 minutes
- Display of ask/bid prices

## Rate Limits

Alpaca's free tier has rate limits. This application batches requests efficiently to minimize API calls:
- Fetches stocks in batches of 200 symbols
- Implements proper error handling for rate limit responses

## Project Structure

```
sp500-tracker/
├── server.js           # Express server and API routes
├── sp500-symbols.js    # List of S&P 500 ticker symbols
├── public/
│   └── index.html      # Web interface
├── .env                # Environment variables (not committed)
├── .gitignore          # Git ignore file
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## Notes

- The S&P 500 symbol list is current as of 2024 but may need periodic updates
- Prices shown are the latest available quotes (ask or bid prices)
- During market hours, prices update in real-time
- Outside market hours, prices reflect the last available quotes

## Troubleshooting

If you encounter errors:
1. Verify your Alpaca API credentials are correct in the `.env` file
2. Check if you're using the correct base URL (paper vs live)
3. Ensure you have an active internet connection
4. Check the console for specific error messages

## License

MIT