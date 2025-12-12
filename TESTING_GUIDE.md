# 🧪 Sentyr Testing Guide

## Dev Server
✅ Running at: http://localhost:3000

---

## 1. Authentication Testing

### Sign Up Flow
1. Visit: http://localhost:3000/sign-up
2. Fill in:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Confirm Password: `TestPassword123!`
   - ✓ Agree to terms
3. Click "Sign Up"
4. **Expected:** Email verification code sent
5. Enter the 6-digit code from your email
6. **Expected:** Redirected to `/dashboard` or `/onboarding`

### Sign In Flow
1. Visit: http://localhost:3000/sign-in
2. Fill in:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
3. Optional: Check "Remember me"
4. Click "Sign In"
5. **Expected:** Redirected to `/dashboard`

### Password Features
- ✓ Click eye icon to toggle password visibility
- ✓ "Forgot password?" link should work

---

## 2. Onboarding Testing

### Company Profile Setup (5 Steps)
Visit: http://localhost:3000/onboarding

#### Step 1: Company Information
- Company Name: `Acme Solutions`
- Team Size: `25`
- NAICS Codes: `541512, 541519`
- Set-Asides: `8(a), SDVOSB`

#### Step 2: Capabilities & Certifications
- Core Capabilities: `Software Development, Cybersecurity, Cloud Computing`
- Certifications: `ISO 9001, CMMI Level 3, SOC 2`
- Past Performance: `5 years of successful DoD contracts...`

#### Step 3: Security & Clearances
- Security Clearances: `Secret, Top Secret`

#### Step 4: Contract Preferences
- Preferred Agencies: `DoD, DHS, NASA`
- Geographic Focus: `DC Metro, Remote`
- Min Contract Value: `100000`
- Max Contract Value: `5000000`

#### Step 5: Review & Submit
- Review all information
- Click "Complete Setup"
- **Expected:** Profile created, redirected to `/dashboard`

---

## 3. Analysis Dashboard Testing

### View Analysis Dashboard
1. Visit: http://localhost:3000/analysis
2. **Expected:** See dashboard with:
   - Available credits count
   - Stats cards (Total, Completed, Strong Bids)
   - "New Analysis" button
   - Empty state or list of analyses

### Create New Analysis (Manual Testing)
1. Click "New Analysis" button
2. Upload a sample RFP document
3. **Expected:** Analysis created with "Processing" status

---

## 4. API Testing (Optional)

### Test Profile API
```bash
# Get profile (requires authentication)
curl http://localhost:3000/api/profile \
  -H "Cookie: ..." \
  | jq

# Check credits
curl http://localhost:3000/api/credits \
  -H "Cookie: ..." \
  | jq
```

### Test Database Connection
Create this test file: `test-db.js`

```javascript
import { sql } from "./lib/db.js";

async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log("✅ Database connected:", result);
  } catch (error) {
    console.error("❌ Database error:", error);
  }
}

testConnection();
```

Run: `node test-db.js`

---

## 5. Common Issues & Solutions

### Issue: "Missing publishableKey" Error
**Solution:** Verify `.env.local` has Clerk keys:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Issue: Database Connection Error
**Solution:** Check `DATABASE_URL` in `.env.local`
```
DATABASE_URL=postgresql://neondb_owner:...@ep-....aws.neon.tech/neondb?sslmode=require
```

### Issue: Profile Not Loading
**Solution:**
1. Check browser console for errors
2. Verify authentication is working
3. Check database tables exist

### Issue: Redirect Loop
**Solution:** Clear browser cookies and sign in again

---

## 6. Success Criteria

✅ **Authentication:**
- [ ] Can create new account
- [ ] Can verify email
- [ ] Can sign in
- [ ] Can sign out
- [ ] Password visibility toggle works

✅ **Onboarding:**
- [ ] All 5 steps display correctly
- [ ] Progress bar updates
- [ ] Form validation works
- [ ] Profile saves to database
- [ ] Redirects to dashboard after completion

✅ **Analysis:**
- [ ] Dashboard displays correctly
- [ ] Stats cards show data
- [ ] Can view list of analyses
- [ ] Empty state displays when no analyses

✅ **Database:**
- [ ] Profile data persists
- [ ] Can fetch profile after refresh
- [ ] Credits system works
- [ ] Analyses are stored

---

## 7. Next Steps After Testing

Once testing is complete:
1. **SAM.gov Integration** - Connect real government opportunities
2. **AI Analysis** - Add Claude/GPT for RFP extraction
3. **File Upload** - Implement document upload to Supabase Storage
4. **Stripe Integration** - Set up payment processing
5. **Landing Page** - Update homepage with features
6. **Deploy** - Push to Vercel

---

## Notes

- Some features are placeholders (marked with TODO comments)
- File upload needs Supabase Storage configuration
- AI analysis needs OpenAI/Anthropic API integration
- Credit consumption is implemented but not yet connected to payments

---

**Status:** Ready for testing! 🚀

Report any issues and I'll fix them immediately.
