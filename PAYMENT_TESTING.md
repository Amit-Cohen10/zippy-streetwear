# 💳 Payment Testing Guide - Zippy Streetwear

## Test Credit Card Data

Use these **test credit card numbers** for testing the checkout process:

### ✅ Valid Test Cards

#### Visa Cards
- **Card Number:** `4532 1234 5678 9012` ⭐ (Primary test card)
- **Card Number:** `4000 0000 0000 0002` 
- **Card Number:** `4111 1111 1111 1111`

#### Mastercard
- **Card Number:** `5555 4444 3333 1111`
- **Card Number:** `5105 1051 0510 5100`

#### American Express  
- **Card Number:** `3782 8224 6310 005`
- **Card Number:** `3714 4963 5398 431`

### 📅 Expiry Date
- **Format:** MM/YY
- **Valid Examples:**
  - `12/25` (December 2025)
  - `06/26` (June 2026) 
  - `09/27` (September 2027)
  - `03/28` (March 2028)

### 🔒 CVV Codes
- **Visa/Mastercard:** `123`, `456`, `789`
- **American Express:** `1234`, `5678`

### 👤 Cardholder Name
- **Examples:**
  - `John Doe`
  - `Jane Smith`
  - `Alex Johnson`
  - `Sarah Wilson`

---

## 🧪 Complete Test Data Sets

### Test Set #1 (Visa)
```
Card Number: 4532 1234 5678 9012
Expiry Date: 12/25
CVV: 123
Name: John Doe
```

### Test Set #2 (Mastercard)
```
Card Number: 5555 4444 3333 1111
Expiry Date: 06/26
CVV: 456
Name: Jane Smith
```

### Test Set #3 (American Express)
```
Card Number: 3782 822463 10005
Expiry Date: 09/27
CVV: 1234
Name: Alex Johnson
```

---

## 🎯 Validation Features

The checkout form includes real-time validation:

### ✅ What You'll See When Valid:
- **Green border** around input fields
- **✅ Green checkmark** with success message
- **Card type detection** (Visa, Mastercard, etc.)

### ❌ What You'll See When Invalid:
- **Red border** around input fields  
- **❌ Red X** with error message
- **Specific error descriptions** (e.g., "Invalid card number", "Card has expired")

### 📝 Input Formatting:
- **Card numbers** are automatically formatted with spaces
- **Expiry dates** automatically add "/" after month
- **CVV** accepts only numbers
- **Names** accept only letters and spaces

---

## 🚫 Invalid Examples (For Testing Error States)

### Invalid Card Numbers:
- `1234 5678 9012 3456` (fails Luhn algorithm)
- `4532 1234 5678` (too short)

### Invalid Expiry Dates:
- `13/25` (invalid month)
- `12/20` (expired date)
- `1225` (wrong format)

### Invalid CVV:
- `12` (too short)
- `12345` (too long)
- `abc` (not numbers)

---

## 💡 Tips for Testing

1. **Try typing invalid data first** to see error messages
2. **Then use the valid test data** to see success states  
3. **Mix valid and invalid fields** to test partial validation
4. **Test all card types** to see different validations
5. **Try expired dates** to test date validation

---

## 🔧 Technical Notes

- **Luhn Algorithm:** Used for credit card number validation
- **Real-time Validation:** Validates as you type and on focus loss
- **Visual Feedback:** Color-coded borders and icons
- **Card Type Detection:** Automatically detects Visa, Mastercard, etc.
- **Date Validation:** Checks for future expiry dates only

---

**⚠️ Note:** These are test numbers only. Do not use real credit card information in the test environment.