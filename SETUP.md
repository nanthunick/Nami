# Nami - Setup Guide 🌊

Welcome to Nami, your minimalist personal finance tracker!

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great!)

## 🚀 Quick Start

### 1. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for your database to be provisioned (takes ~2 minutes)

### 2. Run Database Migrations

In your Supabase dashboard:

1. Go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/001_create_tables.sql`
4. Click **Run**
5. Create another new query
6. Copy and paste the contents of `supabase/seeds/001_seed_categories.sql`
7. Click **Run**

### 3. Configure Environment Variables

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install Dependencies (if not already done)

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

### 6. Open Your App

Open your browser and navigate to:

```
http://localhost:3000
```

## 🎨 Features

- **Notion-inspired UI**: Clean, minimalist design with lots of whitespace
- **Ghost inputs**: Seamless input fields that appear on hover
- **Inter font**: Professional typography
- **Real-time data**: Powered by Supabase
- **Category system**: Pre-seeded with common expense and income categories

## 📝 Usage

1. Click on the date picker to select a transaction date
2. Choose a category from the dropdown
3. Enter a description (optional)
4. Enter the amount
5. Click "Add" to save your transaction

## 🔧 Troubleshooting

### Can't connect to Supabase?
- Make sure your `.env.local` file exists and has the correct values
- Restart your dev server after adding environment variables

### Categories not showing up?
- Make sure you ran the seed script (`001_seed_categories.sql`)
- Check your Supabase dashboard to verify the data is there

### Port 3000 already in use?
Run on a different port:
```bash
npm run dev -- -p 3001
```

## 🎯 Next Steps

- Add a transactions list to view your entries
- Create charts and analytics
- Add filters and search
- Export data to CSV
- Dark mode support

---

Built with ❤️ using Next.js, Supabase, and shadcn/ui

