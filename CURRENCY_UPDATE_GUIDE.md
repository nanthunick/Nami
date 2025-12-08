# Currency Update Guide - Indian Rupee (₹) 💰

## Overview

Your entire Nami application has been updated to use **Indian Rupee (₹)** with proper **Indian numbering format** (lakhs and crores system).

## What Changed

### 1. New Currency Utility Library

Created `src/lib/currency.ts` with three formatting functions:

#### `formatCurrency(amount)`
Formats numbers as Indian Rupee with proper Indian numbering.

**Examples:**
```typescript
formatCurrency(1234)      // "₹1,234.00"
formatCurrency(150000)    // "₹1,50,000.00"
formatCurrency(1000000)   // "₹10,00,000.00"
formatCurrency(5000000)   // "₹50,00,000.00"
```

#### `formatAmount(amount)`
Formats numbers without currency symbol (just Indian formatting).

**Examples:**
```typescript
formatAmount(150000)      // "1,50,000.00"
formatAmount(2500000)     // "25,00,000.00"
```

#### `formatTransactionAmount(amount, type)`
Formats with +/- prefix for income/expense display.

**Examples:**
```typescript
formatTransactionAmount(5000, 'income')    // "+₹5,000.00"
formatTransactionAmount(3000, 'expense')   // "-₹3,000.00"
```

### 2. Indian Numbering System

Uses `en-IN` locale which follows the Indian lakhs/crores system:
- **1,234** - Thousands (same as international)
- **12,345** - Tens of thousands  
- **1,23,456** - Lakhs (commas after every 2 digits after thousands)
- **12,34,567** - Tens of lakhs
- **1,23,45,678** - Crores

This is different from international format:
- International: 1,234,567 (commas every 3 digits)
- Indian: 12,34,567 (comma after thousands, then every 2 digits)

### 3. Updated Components

#### Summary Cards (`SummaryCards.tsx`)
- ✅ Total Expenses: `₹1,50,000.00`
- ✅ Total Income: `₹2,00,000.00`
- ✅ Net Balance: `+₹50,000.00` or `-₹25,000.00`
- ✅ Top Category: `₹45,000.00 spent`

#### Transaction History Table (`TransactionsTable.tsx`)
- ✅ Amount column displays: `+₹5,000.00` (income) or `-₹3,500.00` (expense)
- ✅ Proper Indian formatting for all amounts
- ✅ Color coding maintained (green for income)

#### Transaction Logger (`TransactionLogger.tsx`)
- ✅ Amount input placeholder updated to "Amount (₹)"
- ✅ Clear indication of currency being used

## Technical Implementation

### Using Intl.NumberFormat API

All formatting uses the native JavaScript `Intl.NumberFormat` API:

```typescript
new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(amount)
```

Benefits:
- ✅ Native browser API (no external dependencies)
- ✅ Proper locale support
- ✅ Handles edge cases automatically
- ✅ Consistent formatting across the app

### Locale: en-IN

The `en-IN` locale provides:
- Currency symbol: ₹ (Rupee)
- Decimal separator: `.` (period)
- Thousands separator: `,` (comma)
- Grouping: Indian style (3, then 2, 2, 2...)

## Example Displays

### Before (USD)
```
Total Expenses: $150,000.00
Transaction: -$5,000.00
Top Category: $45,000.00 spent
```

### After (INR)
```
Total Expenses: ₹1,50,000.00
Transaction: -₹5,000.00
Top Category: ₹45,000.00 spent
```

## All Instances Updated

### ✅ Summary Cards
- [x] Total Expenses card
- [x] Total Income card  
- [x] Net Balance card
- [x] Top Category card

### ✅ Transaction Table
- [x] Amount column (with +/- prefix)

### ✅ Transaction Logger
- [x] Amount input placeholder

## Testing the Changes

1. **Start your dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Add a test transaction** with amount: `150000`

3. **Verify displays**:
   - Summary card should show: `₹1,50,000.00`
   - Transaction table should show: `-₹1,50,000.00` or `+₹1,50,000.00`
   - All formatting should use Indian numbering

## Edge Cases Handled

- ✅ **Zero amounts**: `₹0.00`
- ✅ **Decimal values**: `₹1,234.56`
- ✅ **Large numbers**: `₹1,23,45,678.90`
- ✅ **Invalid input**: Falls back to `₹0.00`
- ✅ **Negative balances**: Properly displayed with `-` prefix

## Future Customization

If you want to change currency in the future, just edit `src/lib/currency.ts`:

```typescript
// Change to any other currency
new Intl.NumberFormat('en-US', {  // US format
  style: 'currency',
  currency: 'USD',               // USD currency
  // ...
})

// Examples for other currencies:
// EUR: 'de-DE' locale, 'EUR' currency
// GBP: 'en-GB' locale, 'GBP' currency
// JPY: 'ja-JP' locale, 'JPY' currency
```

## Summary

Your Nami app now fully supports Indian Rupee with proper Indian numbering system! All currency displays throughout the application are consistent and locale-aware.

The changes are:
- ✨ **Symbol**: $ → ₹
- ✨ **Format**: 150,000.00 → 1,50,000.00
- ✨ **Locale**: en-US → en-IN
- ✨ **Consistency**: All components use the same formatting utility

---

Happy expense tracking in Rupees! 🇮🇳💰

