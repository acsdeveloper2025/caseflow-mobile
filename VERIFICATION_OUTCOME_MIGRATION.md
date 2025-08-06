# Verification Outcome Migration Guide

## Overview
This document outlines the changes made to the verification outcome options in the CaseFlow Mobile application, including the removal of certain categories and the implementation of automatic data migration.

## Changes Made

### Removed Verification Outcomes
The following verification outcomes have been **REMOVED** from the system:
- `"Positive"` (standalone)
- `"Negative"`
- `"Shifted"` (standalone)

### Kept Verification Outcomes
The following verification outcomes are **RETAINED**:
- `"Positive & Door Locked"`
- `"Shifted & Door Lock"` (standardized naming)
- `"ERT"` (Entry Restricted)
- `"Untraceable"`
- `"NSP & Door Lock"` (standardized naming)

## Migration Strategy

### Automatic Migration
The system automatically migrates existing cases with deprecated verification outcomes:

| Old Outcome | New Outcome | Rationale |
|-------------|-------------|-----------|
| `"Positive"` | `"Positive & Door Locked"` | Most similar equivalent |
| `"Negative"` | `"NSP & Door Lock"` | Closest functional equivalent |
| `"Shifted"` | `"Shifted & Door Lock"` | Standardized naming |
| `"Door Locked & Shifted"` | `"Shifted & Door Lock"` | Standardized naming |

### Migration Process
1. **Automatic Detection**: When cases are loaded, the system checks for deprecated outcomes
2. **Silent Migration**: Cases with deprecated outcomes are automatically updated
3. **Audit Trail**: Migration notes are added to the case notes for transparency
4. **Data Persistence**: Migrated cases are automatically saved to storage

## Technical Implementation

### Files Modified
1. **`types.ts`**: Updated `VerificationOutcome` enum
2. **`components/CaseCard.tsx`**: Updated form rendering logic and outcome options
3. **`data/initialReportData.ts`**: Updated report mapping for all verification types
4. **`services/caseService.ts`**: Added automatic migration on case loading
5. **`utils/verificationOutcomeMigration.ts`**: New migration utility functions

### Verification Type Specific Changes

#### Property (APF)
- **Removed**: `"Positive"`
- **Available**: `"NSP & Door Lock"`, `"ERT"`, `"Untraceable"`

#### Property (Individual)
- **Removed**: `"Positive"` (standalone)
- **Available**: `"Positive & Door Locked"`, `"NSP & Door Lock"`, `"ERT"`, `"Untraceable"`

#### All Other Types (Residence, Office, Business, etc.)
- **Removed**: `"Positive"`, `"Negative"`, `"Shifted"` (standalone)
- **Available**: `"Positive & Door Locked"`, `"Shifted & Door Lock"`, `"NSP & Door Lock"`, `"ERT"`, `"Untraceable"`

## User Impact

### For New Cases
- Users will only see the new, standardized verification outcome options
- No impact on workflow - all necessary outcomes are still available

### For Existing Cases
- Cases with deprecated outcomes are automatically migrated
- Migration is transparent to users
- Case notes include migration information for audit purposes
- No data loss occurs during migration

## Testing Verification

### To Test Migration
1. Create test cases with old verification outcomes in localStorage
2. Reload the application
3. Check console logs for migration messages
4. Verify cases now have new verification outcomes
5. Check case notes for migration audit trail

### To Test New Outcome Options
1. Open any case
2. Select a verification type
3. Verify only the new outcome options are available
4. Test form rendering for each outcome type

## Rollback Plan

If rollback is needed:
1. Revert the `VerificationOutcome` enum in `types.ts`
2. Restore original form logic in `CaseCard.tsx`
3. Update report mapping in `initialReportData.ts`
4. Remove migration utility and service changes

## Future Considerations

### Adding New Outcomes
To add new verification outcomes:
1. Update the `VerificationOutcome` enum
2. Add form rendering logic in `CaseCard.tsx`
3. Update report mapping in `initialReportData.ts`
4. Create appropriate form components if needed

### Deprecating Outcomes
To deprecate additional outcomes:
1. Add them to the migration map in `verificationOutcomeMigration.ts`
2. Remove from the enum and update related logic
3. Test migration thoroughly before deployment

## Conclusion

The verification outcome migration has been implemented with:
- ✅ Zero data loss
- ✅ Automatic migration
- ✅ Audit trail preservation
- ✅ Backward compatibility during transition
- ✅ Standardized naming conventions

All existing functionality remains intact while providing a cleaner, more standardized set of verification outcomes.
