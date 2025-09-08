# Plan to Fix Unattached/Unused Code

## Overview

This plan addresses all identified issues with unused dependencies, duplicate type definitions, and unused code in the project.

## 1. Remove Unused Dependencies

### 1.1 Remove react-hook-form

- [x] Remove from `package.json` dependencies
- [x] Remove from `package-lock.json` (will be updated when running npm install)
- [x] Update `PLAN.md` to reflect the removal

### 1.2 Remove @hookform/resolvers

- [x] Remove from `package.json` dependencies
- [x] Remove from `package-lock.json` (will be updated when running npm install)
- [x] Update `PLAN.md` to reflect the removal

### 1.3 Remove zod

- [x] Remove from `package.json` dependencies
- [x] Remove from `package-lock.json` (will be updated when running npm install)
- [x] Update `PLAN.md` to reflect the removal

## 2. Clean Up Validation Schema

### 2.1 Remove unused validation.ts file

- [x] Delete `src/lib/validation.ts` entirely since:
  - The Zod schema is never imported/used anywhere
  - The ContactFormData type from Zod is never used
  - The ContactForm component uses Formspree for validation instead

## 3. Consolidate Type Definitions

### 3.1 Clean up src/types/contact.ts

- [x] Keep the `ContactFormData` interface (this is the one actually used)
- [x] Remove the `ContactFormProps` interface (duplicated in ContactForm.tsx)
- [x] Remove the `FormFieldProps` interface (never used anywhere)

### 3.2 Update ContactForm.tsx

- [x] Keep the local `ContactFormProps` interface definition
- [x] Import `ContactFormData` from `src/types/contact.ts` if needed for type safety

## 4. Update Documentation

### 4.1 Update PLAN.md

- [x] Remove references to react-hook-form, @hookform/resolvers, and zod
- [x] Update the form handling section to reflect current Formspree implementation

## 5. Clean Up Dependencies

### 5.1 Run dependency cleanup

- [x] Run `npm install` to update package-lock.json after removing dependencies
- [x] Verify no build errors after cleanup

## 6. Verification Steps

### 6.1 Test the application

- [x] Ensure ContactForm still works correctly
- [x] Verify no TypeScript errors
- [x] Confirm no runtime errors
- [x] Test form submission functionality

### 6.2 Check for any remaining references

- [x] Search for any remaining imports of removed dependencies
- [x] Ensure no broken imports or references

## Summary of Changes

### Files to be modified:

- `package.json` - Remove 3 unused dependencies
- `package-lock.json` - Will be updated automatically
- `PLAN.md` - Update documentation
- `src/types/contact.ts` - Remove 2 unused interfaces
- `src/components/ContactForm.tsx` - Potentially add import for ContactFormData

### Files to be deleted:

- `src/lib/validation.ts` - Entirely unused

### Dependencies to be removed:

- `react-hook-form` - Never imported or used
- `@hookform/resolvers` - Never imported or used
- `zod` - Only used in validation.ts which is being deleted

### Interfaces to be removed:

- `FormFieldProps` - Never used anywhere
- `ContactFormProps` (from types file) - Duplicated in component file

### Interfaces to be kept:

- `ContactFormData` - Actually used in the application

## Expected Outcome

A cleaner, more maintainable codebase with:

- No unused dependencies
- No duplicate type definitions
- No unused code files
- Preserved existing functionality
- Reduced bundle size
- Improved build performance
