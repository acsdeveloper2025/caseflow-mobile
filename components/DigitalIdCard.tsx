import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';

interface UserProfile {
  fullName: string;
  employeeId: string;
  profilePhoto?: string;
  designation?: string;
  department?: string;
  validUntil?: string;
  phoneNumber?: string;
  email?: string;
}

interface DigitalIdCardProps {
  userProfile: UserProfile;
  companyLogo?: string;
  companyName?: string;
  companyAddress?: string;
  authorizedSignature?: string;
  officialStamp?: string;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.9;
const cardHeight = cardWidth * 0.63; // Standard ID card ratio (3.375" x 2.125")

const DigitalIdCard: React.FC<DigitalIdCardProps> = ({
  userProfile,
  companyLogo,
  companyName = "All Check Services LLP",
  companyAddress = "Office No. 406, 4th Floor, Neptune Flying Colors, Din Dayal Upadhyay Rd, Mumbai, Maharashtra 400080",
  authorizedSignature,
  officialStamp,
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Front Side of ID Card */}
      <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
        {/* Header Section with Company Branding */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {companyLogo ? (
              <Image source={companyLogo} style={styles.companyLogo} />
            ) : (
              <View style={[styles.companyLogo, { backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 12 }}>LOGO</Text>
              </View>
            )}
            <View style={styles.headerText}>
              <Text style={styles.companyNameText}>{companyName}</Text>
              <Text style={styles.idCardTitle}>EMPLOYEE ID CARD</Text>
            </View>
          </View>
        </View>

        {/* Main Content Section */}
        <View style={styles.mainContent}>
          {/* User Photo Section */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              {userProfile.profilePhoto ? (
                <Image 
                  source={{ uri: userProfile.profilePhoto }} 
                  style={styles.profilePhoto}
                />
              ) : (
                <View style={styles.placeholderPhoto}>
                  <Text style={styles.placeholderText}>
                    {userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.userName}>{userProfile.fullName.toUpperCase()}</Text>
          </View>

          {/* User Details Section */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Employee ID:</Text>
              <Text style={styles.detailValue}>{userProfile.employeeId}</Text>
            </View>
            
            {userProfile.designation && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Designation:</Text>
                <Text style={styles.detailValue}>{userProfile.designation}</Text>
              </View>
            )}
            
            {userProfile.department && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Department:</Text>
                <Text style={styles.detailValue}>{userProfile.department}</Text>
              </View>
            )}
            
            {userProfile.validUntil && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Valid Until:</Text>
                <Text style={styles.detailValue}>{userProfile.validUntil}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer Section with Authorization */}
        <View style={styles.footer}>
          <View style={styles.authorizationSection}>
            <Text style={styles.authorizationText}>
              This is to certify that {userProfile.fullName.toUpperCase()} is an employee of {companyName}.
            </Text>
            <Text style={styles.authorizationText}>
              {userProfile.fullName.toUpperCase()} is authorized to perform verification activities.
            </Text>
          </View>
          
          <View style={styles.signatureSection}>
            <View style={styles.signatureContainer}>
              {authorizedSignature ? (
                <Image source={authorizedSignature} style={styles.signature} />
              ) : (
                <View style={[styles.signature, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 8, color: '#6B7280' }}>Signature</Text>
                </View>
              )}
              <Text style={styles.signatureLabel}>Authorized Signature</Text>
            </View>
            <View style={styles.stampContainer}>
              {officialStamp ? (
                <Image source={officialStamp} style={styles.stamp} />
              ) : (
                <View style={[styles.stamp, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderRadius: 20 }]}>
                  <Text style={{ fontSize: 6, color: '#6B7280' }}>STAMP</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Company Address */}
        <View style={styles.addressSection}>
          <Text style={styles.addressText}>{companyAddress}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    height: cardHeight * 0.25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#10B981',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  companyNameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  idCardTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.9,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 15,
  },
  photoSection: {
    width: '35%',
    alignItems: 'center',
  },
  photoContainer: {
    marginBottom: 8,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  placeholderPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  userName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 14,
  },
  detailsSection: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: 'center',
  },
  detailRow: {
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 1,
  },
  detailValue: {
    fontSize: 11,
    color: '#1F2937',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  authorizationSection: {
    marginBottom: 10,
  },
  authorizationText: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 10,
    marginBottom: 2,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureContainer: {
    alignItems: 'center',
  },
  signature: {
    width: 60,
    height: 20,
    resizeMode: 'contain',
  },
  signatureLabel: {
    fontSize: 7,
    color: '#6B7280',
    marginTop: 2,
  },
  stampContainer: {
    alignItems: 'center',
  },
  stamp: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    opacity: 0.8,
  },
  addressSection: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  addressText: {
    fontSize: 7,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 9,
  },
});

export default DigitalIdCard;
