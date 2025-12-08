# Category Management Guide 🏷️

## Overview

Your Nami dashboard now includes a complete category management system! You can add, delete, and organize your transaction categories directly from the UI.

## Features

### 1. **Manage Button** ⚙️

**Location:** Next to the Category Select dropdown in the Transaction Logger

**Appearance:**
- Gear icon (Settings)
- Appears on hover (ghost button style)
- Minimalist and unobtrusive
- Matches the Notion aesthetic

**How to Access:**
1. Hover over the Transaction Logger row
2. Look next to the Category dropdown
3. Click the gear icon

### 2. **Management Dialog** 📋

Beautiful Shadcn Dialog with:
- Clean title: "Manage Categories"
- Scrollable content (for many categories)
- Organized by type (Expense vs Income)
- Add new category form at the bottom

## Category List Features

### Visual Display
Each category shows:
- **Color dot** - Visual indicator with the category's color
- **Category name** - Clear text label
- **Grouped by type** - Expenses and Income separated
- **Count display** - Shows total categories per type

### Delete Functionality 🗑️

**Delete Button:**
- Trash icon on the right
- Appears on row hover (ghost until hover)
- Smooth transition effect
- Loading spinner during deletion

**Smart Deletion Protection:**
```
✅ Can delete: Categories with no transactions
❌ Cannot delete: Categories with linked transactions
```

**Error Message Example:**
```
Cannot delete "Food" category. It has 15 transaction(s) 
linked to it. Please delete or reassign those 
transactions first.
```

**Confirmation:**
- Browser confirm dialog before deletion
- Shows category name for safety
- Can be cancelled

### Add New Category ➕

**Form Fields:**
1. **Category Name** - Text input
2. **Type Selector** - Dropdown (Expense/Income)
3. **Add Button** - Creates the category

**Auto-Color Assignment:**
The system automatically assigns a beautiful pastel color from this palette:
- Light Red (#FFE2DD)
- Light Orange (#FFE4C8)
- Light Yellow (#FFF2D9)
- Light Green (#D4EDDA)
- Light Mint (#E7F3EC)
- Light Blue (#D3E5EF)
- Light Sky (#DBEDFF)
- Light Purple (#E8DEFF)
- Light Lavender (#F5E8FF)
- Light Pink (#FFE4F1)
- Light Rose (#FFE4E6)
- Light Gray (#E8E9EB)

**Quick Add:**
- Press Enter in the name field to add
- No need to click the button!

## User Flow Examples

### Adding a New Category

1. **Open Dialog:**
   - Hover over Transaction Logger
   - Click gear icon next to Category dropdown

2. **Add Category:**
   - Scroll to "Add New Category" section
   - Enter name: "Coffee"
   - Select type: "Expense"
   - Click "Add Category" (or press Enter)

3. **Result:**
   - New category appears in the Expense list
   - Random pastel color assigned
   - Dialog stays open for more edits
   - Category dropdown updates automatically

4. **Use It:**
   - Close dialog
   - Open Category dropdown
   - Your new "Coffee" category is there!

### Deleting a Category

#### Scenario A: Empty Category (Success)

1. **Find Category:**
   - Open Manage Categories dialog
   - Locate category you want to delete
   - Hover over it

2. **Delete:**
   - Click trash icon (appears on hover)
   - Confirm: "Delete category 'Gym'?"
   - Click OK

3. **Result:**
   - Category removed from list
   - Dialog updates instantly
   - Category dropdown refreshes
   - Clean and simple!

#### Scenario B: Category with Transactions (Protected)

1. **Attempt Delete:**
   - Click trash icon
   - System checks for transactions

2. **Error Alert:**
   ```
   Cannot delete "Food" category. 
   It has 23 transaction(s) linked to it. 
   Please delete or reassign those transactions first.
   ```

3. **Resolution Options:**
   - Delete all transactions in that category first
   - OR keep the category
   - System protects your data integrity!

## Technical Implementation

### Database Constraint Check

Before deletion, the system runs:
```typescript
// Check if category has any transactions
const { count } = await supabase
  .from("transactions")
  .select("*", { count: "exact", head: true })
  .eq("category_id", category.id);

if (count > 0) {
  // Block deletion with helpful message
}
```

### Auto-Refresh Mechanism

When you close the dialog or make changes:
```typescript
onCategoriesUpdated() → fetchCategories() → Dropdown updates
```

All dropdowns and selects throughout the app automatically show your new categories!

### Color Assignment

```typescript
const PASTEL_COLORS = [
  "#FFE2DD", "#FFE4C8", "#FFF2D9", // ... 12 total colors
];

const getRandomColor = () => {
  return PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
};
```

Each new category gets a random color from the curated palette.

## UI/UX Features

### Notion-Inspired Design
- ✅ Minimal and clean interface
- ✅ Smooth hover transitions
- ✅ Ghost buttons (invisible until needed)
- ✅ Generous whitespace
- ✅ Clear visual hierarchy

### Loading States
- 🔄 Spinner while fetching categories
- 🔄 Spinner while deleting (per item)
- 🔄 Spinner while adding new category
- 🔄 Disabled buttons during operations

### User Feedback
- ✅ Confirmation before destructive actions
- ✅ Clear error messages with context
- ✅ Success indicated by immediate UI update
- ✅ Visual indicators for all states

### Keyboard Support
- ⌨️ Press Enter in name field to add category
- ⌨️ Standard dialog keyboard navigation
- ⌨️ ESC to close dialog

## Best Practices

### Category Naming
- ✅ **Be specific:** "Groceries" not "Food & Stuff"
- ✅ **Be consistent:** Decide on singular vs plural
- ✅ **Be brief:** Fits nicely in pill badges
- ✅ **Use emojis sparingly:** They look good in names!

### Category Organization
- **Expenses:** Group related spending (Transport, Food, Bills)
- **Income:** Different income sources (Salary, Freelance, Gifts)
- **Types:** Keep expense and income categories separate

### When to Delete
✅ **Safe to delete:**
- Duplicate categories
- Unused test categories
- Misspelled categories (with no transactions)

❌ **Don't delete if:**
- Has transaction history
- You might use it again
- Part of your standard budget

**Alternative:** Just stop using the category if you don't want it anymore.

## Component Files

### `ManageCategoriesDialog.tsx`
Main dialog component with:
- Category listing (grouped by type)
- Delete functionality with protection
- Add new category form
- Auto-color assignment

### `TransactionLogger.tsx`
Enhanced with:
- Manage button (gear icon)
- Dialog state management
- Auto-refresh on dialog close

## Security & Data Integrity

### Foreign Key Protection
The database has a foreign key constraint:
```sql
category_id UUID REFERENCES categories(id) ON DELETE CASCADE
```

However, we prevent deletion in the UI first to avoid cascade deletes.

### Transaction Safety
- ✅ Checks transaction count before allowing delete
- ✅ Clear error messages
- ✅ User confirmation required
- ✅ Atomic operations (delete or don't)

## Troubleshooting

### "Can't delete category" Error
**Cause:** Category has transactions linked to it  
**Solution:** 
1. Go to Transaction History
2. Find all transactions with that category
3. Delete those transactions first
4. Then delete the category

### New category doesn't appear
**Cause:** Rare, but possible cache issue  
**Solution:**
1. Close and reopen the dialog
2. Or refresh the page
3. Category should appear

### Color looks wrong
**Cause:** Random assignment from palette  
**Solution:** 
- Currently, colors are auto-assigned
- Future: Add color picker to choose your own

## Future Enhancements (Ideas)

Possible improvements:
- [ ] **Edit category** - Change name and color
- [ ] **Custom colors** - Color picker for new categories
- [ ] **Icons** - Select Lucide icon for each category
- [ ] **Reorder** - Drag and drop to organize
- [ ] **Bulk operations** - Delete multiple at once
- [ ] **Import/Export** - Share categories between devices
- [ ] **Reassign** - Move transactions to different category
- [ ] **Archive** - Hide without deleting
- [ ] **Category budgets** - Set spending limits per category

---

## Quick Reference

| Action | Steps |
|--------|-------|
| **Open Dialog** | Hover Transaction Logger → Click gear icon |
| **Add Category** | Enter name → Select type → Click Add |
| **Delete Category** | Hover category → Click trash → Confirm |
| **Close Dialog** | Click X or click outside |

---

🎉 **Enjoy full control over your categories!**

Your category system is now dynamic, protected, and easy to manage directly from the UI.


