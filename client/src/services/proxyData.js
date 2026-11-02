/**
 * Client-side Proxy Dataset for BusinessDocument Expiry.
 * Stored in localStorage so user interactions (adding, editing, renewing)
 * persist seamlessly even when running standalone or if Vite proxy encounters 502.
 */

const now = new Date();
const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

const defaultDocuments = [
  {
    _id: '660100000000000000000001',
    title: 'Commercial General Liability Policy',
    owner: 'Finance & Risk Management',
    documentType: 'Insurance Policy',
    expiryDate: addDays(6), // ~6 days left -> Expiring Soon
    status: 'Expiring Soon',
    createdAt: new Date('2025-11-01T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2025-11-01T09:00:00.000Z').toISOString(),
  },
  {
    _id: '660100000000000000000002',
    title: 'Municipal Fire & Life Safety Operating Permit',
    owner: 'Facilities & Safety Operations',
    documentType: 'Permit',
    expiryDate: addDays(14), // ~14 days left -> Expiring Soon
    status: 'Expiring Soon',
    createdAt: new Date('2025-05-15T11:00:00.000Z').toISOString(),
    updatedAt: new Date('2025-05-15T11:00:00.000Z').toISOString(),
  },
  {
    _id: '660100000000000000000003',
    title: 'Annual Corporate Trade & Merchant License',
    owner: 'Legal & Regulatory Affairs',
    documentType: 'License',
    expiryDate: addDays(-10), // 10 days overdue -> Expired
    status: 'Expired',
    createdAt: new Date('2024-10-20T08:30:00.000Z').toISOString(),
    updatedAt: new Date('2025-10-23T08:30:00.000Z').toISOString(),
  },
  {
    _id: '660100000000000000000004',
    title: 'Enterprise Cloud Infrastructure SLA (Tier 1)',
    owner: 'Information Technology',
    documentType: 'Vendor Agreement',
    expiryDate: addDays(180), // ~180 days -> Active
    status: 'Active',
    createdAt: new Date('2026-01-10T14:20:00.000Z').toISOString(),
    updatedAt: new Date('2026-01-10T14:20:00.000Z').toISOString(),
  },
  {
    _id: '660100000000000000000005',
    title: 'ISO/IEC 27001 Information Security Certification',
    owner: 'Chief Information Security Officer',
    documentType: 'Certification',
    expiryDate: addDays(275), // ~275 days -> Active
    status: 'Active',
    createdAt: new Date('2025-08-01T10:00:00.000Z').toISOString(),
    updatedAt: new Date('2025-08-01T10:00:00.000Z').toISOString(),
  },
  {
    _id: '660100000000000000000006',
    title: 'Master Facilities Security & Guard Services Agreement',
    owner: 'Corporate Real Estate',
    documentType: 'Contract',
    expiryDate: addDays(25), // ~25 days -> Expiring Soon
    status: 'Expiring Soon',
    createdAt: new Date('2025-11-20T12:00:00.000Z').toISOString(),
    updatedAt: new Date('2025-11-20T12:00:00.000Z').toISOString(),
  },
];

const defaultRenewalHistory = [
  {
    _id: '660200000000000000000001',
    documentId: '660100000000000000000001',
    previousExpiryDate: addDays(-360),
    newExpiryDate: addDays(6),
    renewalDate: addDays(-365),
    completedBy: 'Victoria Sterling (Risk Director)',
    createdAt: addDays(-365),
  },
  {
    _id: '660200000000000000000002',
    documentId: '660100000000000000000003',
    previousExpiryDate: addDays(-375),
    newExpiryDate: addDays(-10),
    renewalDate: addDays(-375),
    completedBy: 'Marcus Vance (General Counsel)',
    createdAt: addDays(-375),
  },
  {
    _id: '660200000000000000000003',
    documentId: '660100000000000000000004',
    previousExpiryDate: addDays(-185),
    newExpiryDate: addDays(180),
    renewalDate: addDays(-185),
    completedBy: 'Devon Hayes (Head of Infrastructure)',
    createdAt: addDays(-185),
  },
];

const STORAGE_KEYS = {
  DOCS: 'bde_proxy_documents',
  HISTORY: 'bde_proxy_renewal_history',
};

export const getStoredProxyDocs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(defaultDocuments));
      return defaultDocuments;
    }
    return JSON.parse(raw);
  } catch {
    return defaultDocuments;
  }
};

export const setStoredProxyDocs = (docs) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save proxy documents to localStorage', e);
  }
};

export const getStoredProxyHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(defaultRenewalHistory));
      return defaultRenewalHistory;
    }
    return JSON.parse(raw);
  } catch {
    return defaultRenewalHistory;
  }
};

export const setStoredProxyHistory = (history) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save proxy history to localStorage', e);
  }
};

