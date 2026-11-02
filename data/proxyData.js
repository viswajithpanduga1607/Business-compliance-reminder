/**
 * Proxy / Seed dataset for BusinessDocument Expiry.
 * Contains realistic enterprise compliance documents and historical renewal logs.
 * Valid 24-char hex ObjectIds are used for strict compatibility with Mongoose & express-validator.
 */

const now = new Date();
const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

const initialDocuments = [
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
    title: 'Master Security & Guard Services Agreement',
    owner: 'Corporate Real Estate',
    documentType: 'Contract',
    expiryDate: addDays(25), // ~25 days -> Expiring Soon
    status: 'Expiring Soon',
    createdAt: new Date('2025-11-20T12:00:00.000Z').toISOString(),
    updatedAt: new Date('2025-11-20T12:00:00.000Z').toISOString(),
  },
];

const initialRenewalHistory = [
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

module.exports = {
  initialDocuments,
  initialRenewalHistory,
};

