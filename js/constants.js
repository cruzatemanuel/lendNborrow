/**
 * constants.js — Shared constants used across frontend modules.
 *
 * These mirror the database enums and provide display labels.
 */

/** Item categories */
export const CATEGORIES = [
  'Electronics',
  'Books',
  'Sports',
  'Tools',
  'Kitchen',
  'Clothing',
  'Other',
];

/** Item physical conditions */
export const CONDITIONS = [
  { value: 'new',      label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good',     label: 'Good' },
  { value: 'fair',     label: 'Fair' },
  { value: 'poor',     label: 'Poor' },
];

/** BatStateU colleges */
export const COLLEGES = [
  'CICS',     // College of Informatics and Computing Sciences
  'CET',      // College of Engineering and Technology
  'CAS',      // College of Arts and Sciences
  'CABEIHM',  // College of Accountancy, Business, Economics, and Intl Hospitality Mgmt
  'CTE',      // College of Teacher Education
  'CON',      // College of Nursing
];

/** BatStateU campuses */
export const CAMPUSES = [
  'Pablo Borbon',
  'Alangilan',
  'Nasugbu',
  'Malvar',
  'Lemery',
  'Rosario',
  'Balayan',
  'Lipa',
  'San Juan',
  'Lobo',
];

/** Borrow request statuses */
export const REQUEST_STATUSES = [
  { value: 'pending',          label: 'Pending',          color: 'warning' },
  { value: 'approved',         label: 'Approved',         color: 'info' },
  { value: 'borrowing',        label: 'Borrowing',        color: 'primary' },
  { value: 'return_submitted', label: 'Return Submitted', color: 'info' },
  { value: 'returned',         label: 'Returned',         color: 'success' },
  { value: 'rejected',         label: 'Rejected',         color: 'danger' },
  { value: 'cancelled',        label: 'Cancelled',        color: 'muted' },
];

/** Item listing statuses */
export const ITEM_STATUSES = [
  { value: 'available',   label: 'Available',   color: 'success' },
  { value: 'borrowed',    label: 'Borrowed',    color: 'warning' },
  { value: 'unavailable', label: 'Unavailable', color: 'muted' },
  { value: 'lost',        label: 'Lost',        color: 'danger' },
];

/** Student verification statuses */
export const VERIFICATION_STATUSES = [
  { value: 'new',       label: 'New',       color: 'muted' },
  { value: 'pending',   label: 'Pending',   color: 'warning' },
  { value: 'active',    label: 'Active',    color: 'success' },
  { value: 'rejected',  label: 'Rejected',  color: 'danger' },
  { value: 'suspended', label: 'Suspended', color: 'danger' },
  { value: 'locked',    label: 'Locked',    color: 'danger' },
];
