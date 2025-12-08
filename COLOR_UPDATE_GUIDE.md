# Notion-Style Category Colors Update Guide 🎨

## What Changed

Your categories now use beautiful Notion-style pastel colors! Instead of bright hex colors, categories now have soft, pastel backgrounds that look professional and are easy on the eyes.

## Color Mapping

| Category | Color | Hex Code |
|----------|-------|----------|
| **Rent & Amenities** | Light Red | `#FFE2DD` |
| **Food** | Light Orange | `#FFE4C8` |
| **Transport** | Light Blue | `#D3E5EF` |
| **Learning** | Light Green | `#E7F3EC` |
| **Health** | Light Red | `#FFE8E8` |
| **Gifts** | Light Purple | `#F5E8FF` |
| **Gym** | Light Blue | `#DBEDFF` |
| **BodyCare** | Light Pink | `#FFE4F1` |
| **Entertainment** | Light Purple | `#E8DEFF` |
| **Relationship** | Light Pink | `#FFE4E6` |
| **Family** | Light Yellow | `#FFF2D9` |
| **Investments** | Light Blue | `#D3E5EF` |
| **Car** | Light Gray | `#E8E9EB` |
| **Insurance** | Light Gray | `#E3E2E0` |
| **Salary** | Light Green | `#D4EDDA` |
| **Freelance** | Light Purple | `#E8DEFF` |
| **Investment Returns** | Light Yellow | `#FFF2D9` |
| **Gift Received** | Light Pink | `#FFE4F1` |
| **Other Income** | Light Blue | `#D3E5EF` |

## How to Update Your Database

### Option 1: Via Supabase SQL Editor (Recommended)

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase/seeds/002_update_category_colors.sql`
5. Click **Run**

This will update all your existing categories with the new pastel colors!

### Option 2: Manually in Table Editor

1. Go to **Table Editor** → **categories**
2. For each category, click to edit
3. Update the `color` column with the hex code from the table above
4. Save changes

## Visual Changes

### 1. Transaction Table
- Categories now appear as **rounded pill badges**
- Soft pastel backgrounds with dark gray text
- Clean, professional Notion-style appearance
- No more small colored dots

### 2. Category Selector
- Dropdown now shows categories as pill badges
- Consistent styling across the app
- Type indicator (income/expense) shown separately

### 3. Summary Cards
- Top category card now displays as a pill badge
- Better visual hierarchy
- More space-efficient

## Styling Details

```tsx
// Notion-style pill badge
className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
style={{
  backgroundColor: category.color,  // Pastel background
  color: '#374151'                  // Dark gray text
}}
```

## Customizing Colors

Want to change a category color? Just update the hex code in Supabase!

Tips for choosing colors:
- Use pastel shades (high lightness, low saturation)
- Test readability with dark gray text (`#374151`)
- Keep similar categories visually distinct
- Notion uses these ranges:
  - Red: `#FFE2DD` - `#FFE8E8`
  - Orange: `#FFE4C8` - `#FFF2D9`
  - Blue: `#D3E5EF` - `#DBEDFF`
  - Purple: `#E8DEFF` - `#F5E8FF`
  - Pink: `#FFE4E6` - `#FFE4F1`
  - Green: `#D4EDDA` - `#E7F3EC`
  - Gray: `#E3E2E0` - `#E8E9EB`

## Before vs After

### Before
- Bright, saturated colors
- Small colored dots
- Less visual clarity

### After ✨
- Soft, pastel backgrounds
- Rounded pill badges
- Professional Notion aesthetic
- Better readability
- More visual distinction

---

Enjoy your beautiful new category badges! 🎨

