import { Attachment } from '../types';

class AttachmentService {
  private baseUrl = 'https://api.caseflow.com/v1';
  private maxFileSize = 10485760; // 10MB in bytes
  private maxAttachments = 10;

  /**
   * Fetch attachments for a specific case
   */
  async getCaseAttachments(caseId: string): Promise<Attachment[]> {
    try {
      console.log(`📎 Fetching attachments for case ${caseId}...`);
      
      // Simulate API call with realistic loading time
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      
      // Generate realistic attachments based on case ID for consistent demo data
      const attachments = this.generateRealisticAttachments(caseId);
      
      console.log(`✅ Found ${attachments.length} attachments for case ${caseId}`);
      return attachments;
      
    } catch (error) {
      console.error(`❌ Failed to fetch attachments for case ${caseId}:`, error);
      throw new Error('Failed to load attachments. Please check your connection and try again.');
    }
  }

  /**
   * Get attachment content for secure viewing
   */
  async getAttachmentContent(attachment: Attachment): Promise<string> {
    try {
      console.log(`📎 Loading content for attachment: ${attachment.name}`);
      
      // Simulate loading time based on file size
      const loadingTime = Math.min(2000, attachment.size / 1000);
      await new Promise(resolve => setTimeout(resolve, loadingTime));
      
      if (attachment.type === 'pdf') {
        // Return base64 PDF content for secure in-app viewing
        return this.generateSecurePdfContent(attachment);
      } else {
        // Return secure image URL for in-app viewing
        return this.generateSecureImageContent(attachment);
      }
      
    } catch (error) {
      console.error(`❌ Failed to load attachment content:`, error);
      throw new Error(`Failed to load ${attachment.name}. Please try again.`);
    }
  }

  /**
   * Generate realistic attachments for demo purposes
   */
  private generateRealisticAttachments(caseId: string): Attachment[] {
    // Create deterministic but varied attachment scenarios based on case ID
    const caseHash = this.hashString(caseId);
    const attachmentCount = caseHash % 6; // 0-5 attachments
    
    if (attachmentCount === 0) return [];

    const allAttachments: Attachment[] = [
      {
        id: `att-${caseId}-1`,
        name: 'download.pdf',
        type: 'pdf',
        mimeType: 'application/pdf',
        size: 2048576, // 2MB
        url: `${this.baseUrl}/files/download-${caseId}.pdf`,
        uploadedAt: this.getRandomDate(-7),
        uploadedBy: 'System Admin',
        description: 'Official property documentation and ownership papers'
      },
      {
        id: `att-${caseId}-2`,
        name: 'Bank_Statement_Jan2024.pdf',
        type: 'pdf',
        mimeType: 'application/pdf',
        size: 1536000, // 1.5MB
        url: `${this.baseUrl}/files/bank-statement-${caseId}.pdf`,
        uploadedAt: this.getRandomDate(-5),
        uploadedBy: 'Financial Analyst',
        description: 'Monthly bank statement for verification'
      },
      {
        id: `att-${caseId}-3`,
        name: 'Identity_Verification.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 892000, // 892KB
        url: `${this.baseUrl}/files/identity-${caseId}.jpg`,
        thumbnailUrl: `${this.baseUrl}/files/identity-${caseId}-thumb.jpg`,
        uploadedAt: this.getRandomDate(-3),
        uploadedBy: 'Verification Officer',
        description: 'Identity document photograph'
      },
      {
        id: `att-${caseId}-4`,
        name: 'Site_Photo_Exterior.png',
        type: 'image',
        mimeType: 'image/png',
        size: 1024000, // 1MB
        url: `${this.baseUrl}/files/site-exterior-${caseId}.png`,
        thumbnailUrl: `${this.baseUrl}/files/site-exterior-${caseId}-thumb.png`,
        uploadedAt: this.getRandomDate(-2),
        uploadedBy: 'Field Agent',
        description: 'Exterior view of the property'
      },
      {
        id: `att-${caseId}-5`,
        name: 'Legal_Agreement.pdf',
        type: 'pdf',
        mimeType: 'application/pdf',
        size: 3145728, // 3MB
        url: `${this.baseUrl}/files/legal-agreement-${caseId}.pdf`,
        uploadedAt: this.getRandomDate(-1),
        uploadedBy: 'Legal Team',
        description: 'Legal agreement and contract documents'
      },
      {
        id: `att-${caseId}-6`,
        name: 'Address_Proof.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 756000, // 756KB
        url: `${this.baseUrl}/files/address-proof-${caseId}.jpg`,
        thumbnailUrl: `${this.baseUrl}/files/address-proof-${caseId}-thumb.jpg`,
        uploadedAt: this.getRandomDate(-1),
        uploadedBy: 'Document Specialist',
        description: 'Address verification document'
      },
      {
        id: `att-${caseId}-7`,
        name: 'Compliance_Report.pdf',
        type: 'pdf',
        mimeType: 'application/pdf',
        size: 2097152, // 2MB
        url: `${this.baseUrl}/files/compliance-${caseId}.pdf`,
        uploadedAt: this.getRandomDate(-4),
        uploadedBy: 'Compliance Officer',
        description: 'Compliance verification report'
      },
      {
        id: `att-${caseId}-8`,
        name: 'Building_Interior.png',
        type: 'image',
        mimeType: 'image/png',
        size: 1310720, // 1.25MB
        url: `${this.baseUrl}/files/building-interior-${caseId}.png`,
        thumbnailUrl: `${this.baseUrl}/files/building-interior-${caseId}-thumb.png`,
        uploadedAt: this.getRandomDate(-2),
        uploadedBy: 'Site Inspector',
        description: 'Interior view of the building'
      },
      {
        id: `att-${caseId}-9`,
        name: 'download.pdf',
        type: 'pdf',
        mimeType: 'application/pdf',
        size: 1024000, // 1MB
        url: `${this.baseUrl}/files/download-copy-${caseId}.pdf`,
        uploadedAt: this.getRandomDate(-5),
        uploadedBy: 'Data Analyst',
        description: 'Additional verification document'
      },
      {
        id: `att-${caseId}-10`,
        name: 'Financial_Statement.pdf',
        type: 'pdf',
        mimeType: 'application/pdf',
        size: 1800000, // 1.8MB
        url: `${this.baseUrl}/files/financial-statement-${caseId}.pdf`,
        uploadedAt: this.getRandomDate(-6),
        uploadedBy: 'Finance Team',
        description: 'Financial statement and income verification'
      }
    ];

    // Return a subset based on the attachment count
    return allAttachments.slice(0, attachmentCount);
  }

  /**
   * Generate secure PDF content for in-app viewing
   */
  private generateSecurePdfContent(attachment: Attachment): string {
    // For demo purposes, use the actual download.pdf file from the codebase
    // In production, this would fetch actual PDF content from secure endpoints

    console.log(`📄 Generating PDF content for: ${attachment.name}`);

    // Use the download.pdf file from the codebase for all PDF attachments
    const documentPath = this.createDocumentSpecificPdf(attachment.name);

    // Return the path to the download.pdf file
    return documentPath;
  }

  /**
   * Create document-specific PDF content
   */
  private createDocumentSpecificPdf(fileName: string): string {
    // For the "download" PDF file, use the actual file from the codebase
    if (fileName === 'download.pdf' || fileName === 'download') {
      // Return path to the actual download.pdf file in the codebase
      return '/download.pdf';
    }

    // Simple PDF templates with different content based on file name
    const templates: { [key: string]: string } = {
      'Property_Documents.pdf': '/download.pdf',
      'Bank_Statement.pdf': '/download.pdf',
      'Bank_Statement_Jan2024.pdf': '/download.pdf',
      'Legal_Agreement.pdf': '/download.pdf',
      'Compliance_Report.pdf': '/download.pdf',
      'Financial_Statement.pdf': '/download.pdf',
      'download.pdf': '/download.pdf',
    };

    // Return the download.pdf file for all PDF attachments
    return templates[fileName] || '/download.pdf';
  }

  /**
   * Generate secure image content for in-app viewing
   */
  private generateSecureImageContent(attachment: Attachment): string {
    // Use high-quality sample images for demo purposes
    const imageUrls = {
      'Identity_Verification.jpg': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      'Site_Photo_Exterior.png': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      'Address_Proof.jpg': 'https://images.unsplash.com/photo-1554224154-26032fced8bd?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      'Building_Interior.png': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80'
    };

    const fileName = attachment.name as keyof typeof imageUrls;
    return imageUrls[fileName] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80';
  }

  /**
   * Utility functions
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private getRandomDate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysAgo);
    return date.toISOString();
  }

  /**
   * Validation and utility methods
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileTypeIcon(attachment: Attachment): string {
    switch (attachment.type) {
      case 'pdf':
        return '📄';
      case 'image':
        return '🖼️';
      default:
        return '📎';
    }
  }

  isValidFileSize(size: number): boolean {
    return size > 0 && size <= this.maxFileSize;
  }

  isValidAttachmentCount(count: number): boolean {
    return count >= 0 && count <= this.maxAttachments;
  }

  isPdfAttachment(attachment: Attachment): boolean {
    return attachment.type === 'pdf' && attachment.mimeType === 'application/pdf';
  }

  isImageAttachment(attachment: Attachment): boolean {
    return attachment.type === 'image' && 
           ['image/jpeg', 'image/jpg', 'image/png'].includes(attachment.mimeType);
  }
}

export const attachmentService = new AttachmentService();
