# SavingsCalc - Financial Management Application

SavingsCalc is a comprehensive financial management application designed to help users track their expenses, income, and savings. It features specialized tracking for ride-sharing income, making it particularly useful for gig economy workers like Uber and Rapido drivers.

## Features

- **User Authentication**: Secure registration and login system
- **Dashboard**: Visual overview of financial status with charts and summaries
- **Expense Tracking**: Categorized expense management with filtering and visualization
- **Income Management**: Track income from various sources
- **Ride-Sharing Analytics**: Specialized tracking for ride-sharing income and expenses with platform-specific metrics (Uber, Rapido, etc.)
- **Data Visualization**: Charts and graphs for better financial insights
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS templates with Tailwind CSS
- **Authentication**: Session-based authentication
- **Data Visualization**: Chart.js

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/savingscalc.git
   cd savingscalc
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and configure your environment variables:
   ```
   cp .env.example .env
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

## Project Structure

```
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── models/             # Database models
├── public/             # Static assets
├── routes/             # Route definitions
├── views/              # EJS templates
│   ├── auth/           # Authentication views
│   ├── dashboard/      # Dashboard views
│   ├── expenses/       # Expense management views
│   ├── income/         # Income management views
│   ├── layouts/        # Layout templates
│   ├── partials/       # Reusable view components
│   └── ride-sharing/   # Ride-sharing specific views
├── app.js              # Application entry point
└── package.json        # Project dependencies
```

## Usage

1. Register a new account or login with existing credentials
2. Navigate to the dashboard to view your financial overview
3. Add income and expenses through their respective sections
4. Track ride-sharing income with detailed metrics
5. View visualizations and reports to gain insights into your financial habits

## Ride-Sharing Feature

The ride-sharing module allows drivers to:
- Track earnings across different platforms (Uber, Rapido, etc.)
- Break down earnings by base fare, tips, incentives, and other sources
- Monitor expenses like fuel, maintenance, commissions, and taxes
- Calculate key metrics like earnings per trip, per hour, and profit margins
- Compare performance across different platforms
- Visualize monthly trends and earnings distribution

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.