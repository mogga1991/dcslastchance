# All Solicitations Feature - Implementation Roadmap

## Project Overview
Complete the All Solicitations feature with qualification checks, bid/no-bid analysis, and advanced filtering.

## Timeline: 4 Sprints (~2 weeks)

---

## Sprint 1: Database & Company Profile Foundation (3-4 days)

### Goals
- Set up database infrastructure
- Create company profile management
- Enable users to store their business information

### Tasks

#### Task 1.1: Database Migrations ✅
- [ ] Run existing saved_opportunities migration
  - Command: `supabase db push`
  - Test: Verify table exists in Supabase dashboard
  - Test: Check RLS policies are active
  - Acceptance: Can query `saved_opportunities` table without errors

- [ ] Create company_profiles migration
  - File: `supabase/migrations/20251214140000_create_company_profiles.sql`
  - Include: Table structure, RLS policies, indexes, triggers
  - Test: Migration applies without errors
  - Acceptance: Table appears in Supabase with all columns

#### Task 1.2: Company Profile API ✅
- [ ] Create GET endpoint (`/api/company-profile`)
  - Returns user's company profile if exists
  - Returns 404 if no profile
  - Test: Call API with valid auth token
  - Acceptance: Returns profile data or appropriate error

- [ ] Create POST endpoint (create profile)
  - Validates required fields (company_name, primary_naics)
  - Creates profile linked to user_id
  - Test: Submit form data, check database
  - Acceptance: Profile created in database

- [ ] Create PATCH endpoint (update profile)
  - Updates specific fields
  - Validates data types
  - Test: Update various fields, verify changes persist
  - Acceptance: Profile updates successfully

#### Task 1.3: Company Profile UI ✅
- [ ] Create profile form component
  - File: `app/dashboard/settings/_components/company-profile-form.tsx`
  - Fields: Basic info, certifications, NAICS codes, capabilities
  - Test: Fill out form, submit, reload page
  - Acceptance: Form saves and loads data correctly

- [ ] Add to Settings page
  - New tab: "Company Profile"
  - Test: Navigate to settings, see profile tab
  - Acceptance: Profile form renders on settings page

- [ ] Add validation
  - Required fields highlighted
  - NAICS code format validation (6 digits)
  - Test: Try submitting incomplete form
  - Acceptance: Validation errors display correctly

#### Sprint 1 Testing Checkpoint ✅
- [ ] User can create company profile
- [ ] User can edit company profile
- [ ] Profile data persists across sessions
- [ ] RLS prevents users from seeing other profiles
- [ ] All form validations work

**Deploy Sprint 1**: Push to production, verify in live environment

---

## Sprint 2: Qualification Check Feature (3-4 days)

### Goals
- Build qualification matching logic
- Create qualification check modal
- Show users how they match opportunity requirements

### Tasks

#### Task 2.1: Qualification Matching Logic ✅
- [ ] Create qualification scoring algorithm
  - File: `lib/qualification-matcher.ts`
  - Functions:
    - `checkNaicsMatch()`
    - `checkSetAsideEligibility()`
    - `checkClearanceLevel()`
    - `checkPastPerformance()`
    - `calculateOverallScore()`
  - Test: Write unit tests for each function
  - Acceptance: Scoring logic returns expected values

#### Task 2.2: Qualification Check API ✅
- [ ] Create POST endpoint (`/api/qualification-check`)
  - Takes: opportunity data
  - Returns: qualification analysis with scores
  - Test: POST with sample opportunity
  - Acceptance: Returns structured qualification results

- [ ] Fetch company profile
  - Get user's profile from database
  - Return error if no profile exists
  - Test: Call API without profile
  - Acceptance: Appropriate error message

- [ ] Calculate match scores
  - Use qualification-matcher functions
  - Return detailed breakdown
  - Test: Verify scores match expected logic
  - Acceptance: All factors calculated correctly

#### Task 2.3: Qualification Check Modal UI ✅
- [ ] Create modal component
  - File: `app/dashboard/_components/qualification-check-modal.tsx`
  - Sections: Overall score, requirements breakdown, recommendations
  - Test: Open modal, view content
  - Acceptance: Modal displays with proper styling

- [ ] Show overall score
  - Large percentage with progress bar
  - Color-coded status (qualified/partial/not qualified)
  - Test: Display various score levels
  - Acceptance: Visual feedback matches score

- [ ] Show factor breakdown
  - List each requirement with ✅/⚠️/❌ icon
  - Show required vs actual values
  - Display action items for gaps
  - Test: View multiple factors
  - Acceptance: All factors display correctly

- [ ] Add action buttons
  - "Update My Profile" → Opens settings
  - "Proceed to Bid Decision" → Opens bid modal
  - Test: Click buttons, verify navigation
  - Acceptance: Buttons work as expected

#### Task 2.4: Wire Up Qualification Check ✅
- [ ] Add state to detail panel
  - Import QualificationCheckModal
  - Add open/close state
  - Test: Open/close modal
  - Acceptance: Modal opens when clicking "Check If I Qualify"

- [ ] Handle no profile case
  - Detect if user has no company profile
  - Show prompt to create profile first
  - Test: User without profile clicks button
  - Acceptance: Redirects to settings to create profile

- [ ] Fetch qualification data
  - Call API when modal opens
  - Show loading state
  - Display results
  - Test: Open modal, watch API call
  - Acceptance: Results load and display

#### Sprint 2 Testing Checkpoint ✅
- [ ] Qualification modal opens from detail panel
- [ ] Users without profile are prompted to create one
- [ ] Qualification scores calculate correctly
- [ ] Visual feedback (colors, icons) matches scores
- [ ] Users can proceed to bid decision from modal
- [ ] Error states handled gracefully

**Deploy Sprint 2**: Push to production, test with real users

---

## Sprint 3: Bid/No-Bid Decision Feature (3-4 days)

### Goals
- Build bid decision analysis
- Create bid decision modal
- Save bid decisions to database

### Tasks

#### Task 3.1: Bid Decision Analysis Logic ✅
- [ ] Create bid scoring algorithm
  - File: `lib/bid-analyzer.ts`
  - Functions:
    - `analyzeCompetitiveLandscape()`
    - `analyzeTechnicalFit()`
    - `analyzePriceCompetitiveness()`
    - `analyzeTimelineAndResources()`
    - `analyzeStrategicValue()`
    - `calculateWinProbability()`
  - Test: Unit tests for each function
  - Acceptance: Algorithms return consistent scores

#### Task 3.2: Bid Analysis API ✅
- [ ] Create POST endpoint (`/api/bid-analysis`)
  - Takes: opportunity + company profile
  - Returns: recommendation, scores, insights
  - Test: POST with sample data
  - Acceptance: Returns structured analysis

- [ ] Implement scoring logic
  - Calculate factor scores (1-10)
  - Generate insights for each factor
  - Determine overall recommendation
  - Test: Various opportunity types
  - Acceptance: Recommendations make sense

- [ ] Calculate win probability
  - Use weighted factors
  - Return percentage (0-100)
  - Test: Compare multiple opportunities
  - Acceptance: Probabilities correlate with scores

#### Task 3.3: Bid Decision Modal UI ✅
- [ ] Create modal component
  - File: `app/dashboard/_components/bid-decision-modal.tsx`
  - Sections: Recommendation, factors, risks, actions
  - Test: Open modal, view layout
  - Acceptance: Modal displays with proper styling

- [ ] Show AI recommendation
  - Large "BID" or "NO BID" display
  - Win probability percentage
  - Confidence level indicator
  - Test: Display different recommendations
  - Acceptance: Visual feedback is clear

- [ ] Show analysis factors
  - Each factor with score out of 10
  - Expandable details for each
  - Color-coded scores (green/yellow/red)
  - Test: View all factors
  - Acceptance: Factors display with proper formatting

- [ ] Show risks and actions
  - List of identified risks
  - Recommended next steps
  - Test: View recommendations
  - Acceptance: Content is readable and actionable

- [ ] Add decision buttons
  - "✅ BID" and "❌ NO BID" buttons
  - Notes textarea for user comments
  - Test: Click buttons with/without notes
  - Acceptance: Buttons trigger save action

#### Task 3.4: Save Bid Decisions ✅
- [ ] Update saved_opportunities on decision
  - PATCH existing record or CREATE new one
  - Set bid_decision field ('bid' or 'no_bid')
  - Save bid_decision_reasoning
  - Update status ('pursuing' or 'no_bid')
  - Test: Make decision, check database
  - Acceptance: Decision persists in database

- [ ] Show success feedback
  - Toast notification "Decision saved!"
  - Update opportunity status indicator
  - Test: Save decision, see confirmation
  - Acceptance: User sees success message

- [ ] Close modal after save
  - Modal closes automatically
  - Detail panel updates status
  - Test: Save decision, modal closes
  - Acceptance: Clean UX flow

#### Sprint 3 Testing Checkpoint ✅
- [ ] Bid analysis modal opens and loads data
- [ ] Analysis factors calculate correctly
- [ ] Win probability makes sense
- [ ] Users can save BID or NO BID decisions
- [ ] Decisions persist in database
- [ ] Success feedback displays
- [ ] Modal closes cleanly after save

**Deploy Sprint 3**: Push to production, gather user feedback

---

## Sprint 4: Advanced Filters & Polish (2-3 days)

### Goals
- Add comprehensive filtering
- Improve search experience
- Final QA and optimization

### Tasks

#### Task 4.1: Add Filter UI Components ✅
- [ ] Add Set-Aside filter dropdown
  - Options: SBA, 8(a), SDVOSB, WOSB, HUBZone, etc.
  - Test: Select different options
  - Acceptance: Filter dropdown works

- [ ] Add NAICS code filter input
  - Text input with validation
  - Format: 6 digits
  - Test: Enter various NAICS codes
  - Acceptance: Input validates correctly

- [ ] Add date range pickers
  - Posted date range (from/to)
  - Response deadline range (from/to)
  - Test: Select various date ranges
  - Acceptance: Date pickers work

- [ ] Add active filters display
  - Show applied filters as badges
  - X button to remove each filter
  - "Clear All" button
  - Test: Apply filters, remove them
  - Acceptance: Filter tags display and remove correctly

#### Task 4.2: Update API for Filters ✅
- [ ] Extend solicitations API
  - Add parameters: setAside, naicsCode, dates
  - Update SAM.gov API call
  - Test: API call with filters
  - Acceptance: API returns filtered results

- [ ] Add filter validation
  - Validate date formats
  - Validate NAICS code format
  - Test: Invalid filter values
  - Acceptance: Validation errors return

- [ ] Optimize query performance
  - Add caching where appropriate
  - Test: Load time with multiple filters
  - Acceptance: Filters don't slow down significantly

#### Task 4.3: Wire Up Filters ✅
- [ ] Connect filters to state
  - useState for each filter
  - Update URL params (optional)
  - Test: Change filters, check state
  - Acceptance: State updates correctly

- [ ] Trigger API calls on filter change
  - Debounce text inputs
  - Immediate for dropdowns/dates
  - Reset to page 1 on filter change
  - Test: Apply various filter combinations
  - Acceptance: Results update correctly

- [ ] Persist filters across navigation
  - Store in localStorage or URL params
  - Restore on page load
  - Test: Set filters, refresh page
  - Acceptance: Filters persist (optional but nice)

#### Task 4.4: Final QA & Polish ✅
- [ ] Test complete user flow
  - Browse → View details → Check qualification → Make bid decision → Save
  - Test: Complete flow multiple times
  - Acceptance: No errors in full flow

- [ ] Test edge cases
  - User without profile
  - Opportunity with missing data
  - Network errors
  - Test: Various edge cases
  - Acceptance: Graceful error handling

- [ ] Performance optimization
  - Check load times
  - Optimize images if any
  - Review bundle size
  - Test: Page load speed
  - Acceptance: Fast load times (<3s)

- [ ] Mobile responsiveness
  - Test on mobile devices
  - Check modal sizing
  - Test filters on mobile
  - Acceptance: Works well on mobile

- [ ] Accessibility audit
  - Keyboard navigation
  - Screen reader compatibility
  - Color contrast
  - Test: Navigate with keyboard only
  - Acceptance: Accessible to all users

#### Sprint 4 Testing Checkpoint ✅
- [ ] All filters work correctly
- [ ] Filter combinations produce expected results
- [ ] Performance is acceptable
- [ ] Mobile experience is good
- [ ] Accessibility is adequate
- [ ] No console errors
- [ ] Complete user flow works end-to-end

**Final Deploy**: Production deployment with full feature set

---

## Post-Launch Tasks

### Monitoring ✅
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor API response times
- [ ] Track feature usage analytics

### Future Enhancements 🚀
- [ ] AI-powered bid analysis using Claude/GPT
- [ ] Email notifications for matching opportunities
- [ ] Saved searches/filters
- [ ] Opportunity comparison tool
- [ ] Export opportunities to PDF/Excel
- [ ] Team collaboration features

---

## Testing Strategy

### Unit Tests
- Qualification matching logic
- Bid analysis algorithms
- API endpoint handlers

### Integration Tests
- Company profile CRUD flow
- Qualification check complete flow
- Bid decision save flow
- Filter application and results

### E2E Tests
- User creates profile → Checks qualification → Makes bid decision
- User applies filters → Views results → Saves opportunity
- User without profile → Prompted to create → Completes flow

### Manual Testing Checklist
- [ ] Create company profile
- [ ] Edit company profile
- [ ] View solicitations
- [ ] Apply each filter type
- [ ] Open detail panel
- [ ] Run qualification check
- [ ] Run bid analysis
- [ ] Save bid decision
- [ ] View saved opportunities
- [ ] Test on mobile
- [ ] Test with slow network
- [ ] Test with no internet (offline state)

---

## Success Metrics

### Functionality
- ✅ All features work without errors
- ✅ 95%+ of user flows complete successfully
- ✅ <500ms API response time average
- ✅ Zero critical bugs in production

### User Experience
- ✅ Users can complete full flow in <5 minutes
- ✅ Modal interactions feel smooth
- ✅ Filter results update in <2 seconds
- ✅ Mobile experience is seamless

### Business Value
- ✅ Users create company profiles
- ✅ Qualification checks are run
- ✅ Bid decisions are being made
- ✅ Opportunities are being saved
- ✅ Users return to use the feature

---

## Dependencies

### External APIs
- SAM.gov API (already integrated)
- Supabase (database and auth)

### Internal Dependencies
- Company profile must exist for qualification/bid features
- User must be authenticated for all features

### Nice-to-Have (Not Blocking)
- AI integration (Claude API) for smarter analysis
- Email service for notifications

---

## Risk Mitigation

### Risk: SAM.gov API rate limits
**Mitigation**: Implement caching, paginate carefully

### Risk: Users don't create company profiles
**Mitigation**: Onboarding flow, incentives, prompts

### Risk: Qualification/bid logic inaccurate
**Mitigation**: Start simple, gather feedback, iterate

### Risk: Performance issues with large result sets
**Mitigation**: Pagination, lazy loading, optimize queries

---

## Notes

- Start each sprint with a kickoff meeting
- End each sprint with demo and retrospective
- Deploy to staging after each task for testing
- Deploy to production after each sprint checkpoint
- Gather user feedback continuously
- Prioritize bug fixes over new features if issues arise

---

## Team Communication

### Daily Standups
- What did you complete?
- What are you working on today?
- Any blockers?

### Sprint Reviews
- Demo completed features
- Gather stakeholder feedback
- Adjust priorities if needed

### Retrospectives
- What went well?
- What can be improved?
- Action items for next sprint

---

**Last Updated**: 2025-12-14
**Status**: Ready to start Sprint 1
