# AI Failure Mode Audit

## Project

**HW1_W2 – Production Enterprise Data-Grid**

## Purpose

This report documents defects and potential failure modes identified during AI-assisted development and code review. Each entry describes the affected code, diagnostic method, impact, corrective action, and verification status.

---

## Vulnerability 01: Incorrect Status Filtering

**Status:** Fixed — verification based on browser testing.

### Defect Description

The initial filtering implementation used substring matching for all columns. Consequently, searching for `Active` could also return employees whose status was `Inactive`, because the string `Active` is contained within `Inactive`.

### Affected File

`src/data-grid.ts` — `applyFilterAndSort()`.

### Diagnostic Method and Evidence

The defect was identified by testing the Status filter in the browser. Searching for `Active` returned records with an `Inactive` status.

### Impact

Users could receive incorrect filtering results, reducing the reliability of the employee directory.

### Corrected Implementation

Status filtering was changed to use exact matching, while other columns continue to support partial matching.

```typescript
if (column.accessorKey === "status") {
  return normalizedValue === query;
}

return normalizedValue.includes(query);
```

### Verification

The TypeScript check and production build completed successfully after the correction. Browser testing was used to verify that searching for `Active` and `Inactive` returns the corresponding status records.

---

## Vulnerability 02: Unused TypeScript Import

**Status:** Fixed — compiler verification completed.

### Defect Description

During development of the Data Grid component, the TypeScript compiler reported error `TS6196` because `ColumnDef` was imported but never used.

### Affected File

`src/data-grid.ts` — import declaration for `ColumnDef` and `DataGridProps`.

### Diagnostic Method and Evidence

The issue was detected by running:

```bash
npx tsc --noEmit
```

The compiler reported:

```text
error TS6196: 'ColumnDef' is declared but never used.
```

### Impact

The unused import caused the TypeScript validation step to fail, preventing the project from passing the configured type-checking process.

### Corrected Implementation

The unused `ColumnDef` import was removed, while the required `DataGridProps` import was retained.

```typescript
import type { DataGridProps } from "./data-grid-contract";
```

### Verification

After the correction, `npx tsc --noEmit` completed without errors, and `npm run build` completed successfully.

---

## Vulnerability 03: Focus Management After Data Re-rendering

**Status:** Requires additional manual verification.

### Defect Description

Code review identified a potential focus-management issue when the table body is re-rendered after filtering, sorting, or pagination.

The `renderRows()` function removes the existing table rows using `tbody.replaceChildren()` and creates new DOM elements. The current implementation initializes the first
