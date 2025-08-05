import { Case, CaseStatus, VerificationType } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_STORAGE_KEY = 'caseflow_cases';

const getInitialMockData = (): Case[] => [
  // 1. Residence Case
  {
    id: 'CASE-001',
    title: 'Residence Verification - Priya Sharma',
    description: 'Verify the current residential address of Priya Sharma for a personal loan application. Address: 12B, Ocean View Apartments, Marine Drive, Mumbai.',
    customer: { name: 'Priya Sharma', contact: 'priya.sharma@email.com' },
    status: CaseStatus.Assigned,
    isSaved: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    verificationType: VerificationType.Residence,
    verificationOutcome: null,
    bankName: 'HDFC Bank',
    product: 'Personal Loan',
    trigger: 'Address Verification',
    visitAddress: '12B, Ocean View Apartments, Marine Drive, Mumbai.',
    systemContactNumber: '9876543210',
    customerCallingCode: '+91',
    applicantStatus: 'Applicant',
  },
  // 2. Residence-cum-office Case
  {
    id: 'CASE-002',
    title: 'Resi-cum-Office Check - Raj Kumar',
    description: 'Confirm the dual use of the property as both a residence and office for a business loan. Address: 45, Startup Lane, Koramangala, Bengaluru.',
    customer: { name: 'Raj Kumar', contact: 'raj.kumar@email.com' },
    status: CaseStatus.Assigned,
    isSaved: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    verificationType: VerificationType.ResidenceCumOffice,
    verificationOutcome: null,
    bankName: 'ICICI Bank',
    product: 'Business Loan',
    trigger: 'Dual Use Verification',
    visitAddress: '45, Startup Lane, Koramangala, Bengaluru.',
    systemContactNumber: '9876543211',
    customerCallingCode: '+91',
    applicantStatus: 'Applicant',
  },
  // 3. Office Case
  {
    id: 'CASE-003',
    title: 'Office Verification - Tech Solutions Inc.',
    description: 'Verify the physical office address and operational status of Tech Solutions Inc. Address: Unit 501, Cyber Towers, Hitech City, Hyderabad.',
    customer: { name: 'Tech Solutions Inc.', contact: 'hr@techsolutions.com' },
    status: CaseStatus.Assigned,
    isSaved: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    verificationType: VerificationType.Office,
    verificationOutcome: null,
    bankName: 'Axis Bank',
    product: 'Corporate Loan',
    trigger: 'Operational Status Check',
    visitAddress: 'Unit 501, Cyber Towers, Hitech City, Hyderabad.',
    systemContactNumber: '9876543212',
    customerCallingCode: '+91',
    applicantStatus: 'Company',
  },
  // 4. Business Case
  {
    id: 'CASE-004',
    title: 'Business Verification - Gupta Enterprises',
    description: 'Conduct a business verification for Gupta Enterprises to assess their operational capacity. Address: 17, Industrial Area, Phase 2, Chandigarh.',
    customer: { name: 'Gupta Enterprises', contact: 'contact@guptaent.com' },
    status: CaseStatus.Assigned,
    isSaved: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    verificationType: VerificationType.Business,
    verificationOutcome: null,
    bankName: 'Punjab National Bank',
    product: 'Working Capital Loan',
    trigger: 'Capacity Assessment',
    visitAddress: '17, Industrial Area, Phase 2, Chandigarh.',
    systemContactNumber: '9876543213',
    customerCallingCode: '+91',
    applicantStatus: 'Proprietor',
  },
  // 5. Builder Case
  {
    id: 'CASE-005',
    title: 'Builder Site Verification - Apex Constructions',
    description: "Verify the construction site and progress for Apex Constructions' new project. Site: Plot 8, Sector 62, Noida.",
    customer: { name: 'Apex Constructions', contact: 'projects@apexconst.com' },
    status: CaseStatus.Assigned,
    isSaved: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    verificationType: VerificationType.Builder,
    verificationOutcome: null,
    bankName: 'SBI',
    product: 'Project Finance',
    trigger: 'Site Progress Verification',
    visitAddress: 'Plot 8, Sector 62, Noida.',
    systemContactNumber: '9876543214',
    customerCallingCode: '+91',
    applicantStatus: 'Developer',
  },
  // 6. NOC Case
  {
    id: 'CASE-006',
    title: 'NOC Verification - Green Valley Society',
    description: 'Obtain and verify the No Objection Certificate from the Green Valley Society management for a property sale. Address: Green Valley Society, near MG Road, Pune.',
    customer: { name: 'Green Valley Society', contact: 'secretary@greenvalley.com' },
    status: CaseStatus.Assigned,
    isSaved: false,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    verificationType: VerificationType.NOC,
    verificationOutcome: null,
    bankName: 'Kotak Mahindra Bank',
    product: 'Property Sale',
    trigger: 'NOC Verification',
    visitAddress: 'Green Valley Society, near MG Road, Pune.',
    systemContactNumber: '9876543215',
    customerCallingCode: '+91',
    applicantStatus: 'Society',
  },
  // 7. Property (APF) Case
  {
    id: 'CASE-007',
    title: 'Property APF Verification - Lotus Towers',
    description: 'Verify the Approved Project Finance (APF) status for the Lotus Towers project. Location: near Airport Road, Mohali.',
    customer: { name: 'Lotus Towers Developer', contact: 'sales@lotustowers.com' },
    status: CaseStatus.Assigned,
    isSaved: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    verificationType: VerificationType.PropertyAPF,
    verificationOutcome: null,
    bankName: 'Canara Bank',
    product: 'Project Finance',
    trigger: 'APF Status Verification',
    visitAddress: 'Lotus Towers project site, near Airport Road, Mohali.',
    systemContactNumber: '9876543216',
    customerCallingCode: '+91',
    applicantStatus: 'Developer',
  },
  // 8. Property (Individual) Case
  {
    id: 'CASE-008',
    title: 'Property Verification - Mr. Verma',
    description: 'Conduct a verification of the property owned by Mr. Anil Verma for a mortgage application. Property: Bungalow No. 24, Jubilee Hills, Hyderabad.',
    customer: { name: 'Anil Verma', contact: 'anil.verma@email.com' },
    status: CaseStatus.Assigned,
    isSaved: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    verificationType: VerificationType.PropertyIndividual,
    verificationOutcome: null,
    bankName: 'Bank of Baroda',
    product: 'Mortgage Loan',
    trigger: 'Property Title Verification',
    visitAddress: 'Bungalow No. 24, Jubilee Hills, Hyderabad.',
    systemContactNumber: '9876543217',
    customerCallingCode: '+91',
    applicantStatus: 'Co-Applicant',
  },
  // 9. DSA/DST & Connector Case
  {
    id: 'CASE-009',
    title: 'DSA/DST Connector Verification - Quick Loans',
    description: 'Verify the business premises and operations for the DSA partner, Quick Loans. Office: 3rd Floor, Commercial Complex, Karol Bagh, Delhi.',
    customer: { name: 'Quick Loans Agency', contact: 'partner@quickloans.com' },
    status: CaseStatus.Assigned,
    isSaved: false,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    verificationType: VerificationType.Connector,
    verificationOutcome: null,
    bankName: 'Yes Bank',
    product: 'Partner Verification',
    trigger: 'Business Premises Check',
    visitAddress: '3rd Floor, Commercial Complex, Karol Bagh, Delhi.',
    systemContactNumber: '9876543218',
    customerCallingCode: '+91',
    applicantStatus: 'Partner',
  },
].map((c, index) => ({ 
  ...c, 
  order: index,
  inProgressAt: undefined,
  savedAt: undefined,
  completedAt: undefined,
}));

class CaseService {
  constructor() {
    this.initializeData();
  }

  private async initializeData() {
      const existingData = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
      if (!existingData) {
          await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(getInitialMockData()));
      }
  }

  private async readFromStorage(): Promise<Case[]> {
    const data = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private async writeToStorage(cases: Case[]): Promise<void> {
    await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cases));
  }

  async getCases(): Promise<Case[]> {
    return this.readFromStorage();
  }

  async getCase(id: string): Promise<Case | undefined> {
    const cases = await this.readFromStorage();
    return cases.find(c => c.id === id);
  }

  async updateCase(id: string, updates: Partial<Case>): Promise<Case> {
    const cases = await this.readFromStorage();
    const caseIndex = cases.findIndex(c => c.id === id);
    if (caseIndex === -1) {
      throw new Error('Case not found');
    }
    const updatedCase = { ...cases[caseIndex], ...updates, updatedAt: new Date().toISOString() };
    cases[caseIndex] = updatedCase;
    await this.writeToStorage(cases);
    return updatedCase;
  }
  
  async revokeCase(id: string, reason: string): Promise<void> {
    const cases = await this.readFromStorage();
    const updatedCases = cases.filter(c => c.id !== id);
    console.log(`Case ${id} revoked. Reason: ${reason}. Simulating sending to server.`);
    await this.writeToStorage(updatedCases);
  }

  async syncWithServer(): Promise<Case[]> {
    console.log("Simulating sync with server...");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency
    
    const localCases = await this.readFromStorage();

    // In a real app, this would fetch new/updated cases from a server
    // and merge them with local data. For this demo, we'll just log.
    
    console.log("Sync complete. No new data from server.");
    return localCases;
  }
}

export const caseService = new CaseService();
