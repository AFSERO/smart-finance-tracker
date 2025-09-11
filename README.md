# Personal Finance Tracker

A modern web application for tracking personal finances, managing assets, and achieving financial goals.

## Features

- 🔐 **Authentication** - Secure user registration and login
- 📊 **Dashboard** - Comprehensive financial overview with key metrics
- 💰 **Transaction Management** - Track income and expenses with categorization
- 📈 **Asset Tracking** - Monitor gold, stocks, crypto, and other assets with real-time pricing
- 📄 **PDF Upload** - Automatically parse bank statements and categorize transactions
- 🎯 **Goal Tracking** - Set and monitor financial goals
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **UI Components**: Custom components with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd smart-finance-tracker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp config.example.env .env.local
```

4. Configure your database URL in `.env.local`
```env
DATABASE_URL="postgresql://username:password@localhost:5432/finance_tracker?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
```

5. Run database migrations
```bash
npx prisma migrate dev
```

6. Start the development server
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── auth-page.tsx     # Authentication page
│   ├── dashboard.tsx     # Main dashboard
│   ├── navigation.tsx    # Navigation component
│   └── providers.tsx     # Context providers
└── lib/                  # Utilities and configurations
    ├── auth.ts           # NextAuth configuration
    ├── db.ts             # Database connection
    └── utils.ts          # Utility functions
```

## Development Status

- ✅ Project setup and configuration
- ✅ Database schema design
- ✅ Authentication system
- ✅ Basic UI components
- ✅ Dashboard layout
- 🚧 Transaction management (in progress)
- 🚧 Asset management
- 🚧 PDF parsing
- 🚧 AI categorization
- 🚧 Charts and visualizations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).