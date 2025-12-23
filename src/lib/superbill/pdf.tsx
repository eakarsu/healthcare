import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { SuperbillData } from './generator'

// Register fonts (optional - uses default fonts if not registered)
// Font.register({ family: 'Roboto', src: '/fonts/Roboto-Regular.ttf' })

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#333',
    paddingBottom: 10,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  practiceInfo: {
    fontSize: 9,
    color: '#444',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  column: {
    flex: 1,
    paddingRight: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 5,
    marginBottom: 8,
    marginTop: 10,
  },
  label: {
    fontSize: 8,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    marginBottom: 6,
  },
  table: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 9,
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  codeColumn: {
    width: 60,
  },
  descColumn: {
    flex: 1,
  },
  modColumn: {
    width: 40,
  },
  qtyColumn: {
    width: 30,
    textAlign: 'right',
  },
  chargeColumn: {
    width: 60,
    textAlign: 'right',
  },
  diagnosisRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  diagnosisCode: {
    width: 60,
    fontSize: 9,
    fontWeight: 'bold',
  },
  diagnosisDesc: {
    flex: 1,
    fontSize: 9,
  },
  summaryBox: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 10,
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  summaryTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  signatureLine: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#333',
    width: 200,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#666',
  },
})

interface SuperbillPDFProps {
  data: SuperbillData
}

export function SuperbillPDF({ data }: SuperbillPDFProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header - Practice Info */}
        <View style={styles.header}>
          <Text style={styles.practiceName}>{data.practice.name}</Text>
          <Text style={styles.practiceInfo}>
            {data.practice.address}, {data.practice.city}, {data.practice.state} {data.practice.zip}
          </Text>
          <Text style={styles.practiceInfo}>
            Phone: {data.practice.phone} {data.practice.fax ? `| Fax: ${data.practice.fax}` : ''}
          </Text>
          <Text style={styles.practiceInfo}>
            NPI: {data.practice.npi} | Tax ID: {data.practice.taxId}
          </Text>
        </View>

        <Text style={styles.title}>SUPERBILL / WALKOUT STATEMENT</Text>
        <Text style={styles.subtitle}>Superbill #: {data.superbillNumber}</Text>

        {/* Patient and Visit Info */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>PATIENT INFORMATION</Text>
            <Text style={styles.label}>Patient Name</Text>
            <Text style={styles.value}>{data.patient.name}</Text>
            <Text style={styles.label}>Date of Birth</Text>
            <Text style={styles.value}>{data.patient.dateOfBirth}</Text>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{data.patient.address}</Text>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{data.patient.phone}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>VISIT INFORMATION</Text>
            <Text style={styles.label}>Date of Service</Text>
            <Text style={styles.value}>{data.visit.date}</Text>
            <Text style={styles.label}>Place of Service</Text>
            <Text style={styles.value}>{data.visit.placeOfService} ({data.visit.placeOfServiceCode})</Text>
            <Text style={styles.label}>Provider</Text>
            <Text style={styles.value}>{data.provider.name}, {data.provider.credentials.join(', ')}</Text>
            <Text style={styles.label}>Provider NPI</Text>
            <Text style={styles.value}>{data.provider.npi}</Text>
          </View>
        </View>

        {/* Insurance Info */}
        {data.insurance && (
          <View>
            <Text style={styles.sectionTitle}>INSURANCE INFORMATION</Text>
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Insurance Plan</Text>
                <Text style={styles.value}>{data.insurance.planName}</Text>
                <Text style={styles.label}>Payer</Text>
                <Text style={styles.value}>{data.insurance.payerName}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Member ID</Text>
                <Text style={styles.value}>{data.insurance.memberId}</Text>
                <Text style={styles.label}>Group Number</Text>
                <Text style={styles.value}>{data.insurance.groupNumber || 'N/A'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Diagnoses */}
        <Text style={styles.sectionTitle}>DIAGNOSES</Text>
        {data.diagnoses.map((dx, index) => (
          <View key={index} style={styles.diagnosisRow}>
            <Text style={styles.diagnosisCode}>{index + 1}. {dx.code}</Text>
            <Text style={styles.diagnosisDesc}>{dx.description}</Text>
          </View>
        ))}

        {/* Procedures Table */}
        <Text style={styles.sectionTitle}>SERVICES RENDERED</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.codeColumn]}>CPT Code</Text>
            <Text style={[styles.tableCellHeader, styles.descColumn]}>Description</Text>
            <Text style={[styles.tableCellHeader, styles.modColumn]}>Mod</Text>
            <Text style={[styles.tableCellHeader, styles.qtyColumn]}>Qty</Text>
            <Text style={[styles.tableCellHeader, styles.chargeColumn]}>Charge</Text>
          </View>
          {data.procedures.map((proc, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.codeColumn]}>{proc.cptCode}</Text>
              <Text style={[styles.tableCell, styles.descColumn]}>{proc.description}</Text>
              <Text style={[styles.tableCell, styles.modColumn]}>{proc.modifiers.join(',')}</Text>
              <Text style={[styles.tableCell, styles.qtyColumn]}>{proc.quantity}</Text>
              <Text style={[styles.tableCell, styles.chargeColumn]}>${proc.totalCharge.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Financial Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Charges:</Text>
            <Text style={styles.summaryValue}>${data.summary.totalCharges.toFixed(2)}</Text>
          </View>
          {data.summary.copay && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Copay:</Text>
              <Text style={styles.summaryValue}>${data.summary.copay.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Insurance Estimate:</Text>
            <Text style={styles.summaryValue}>${data.summary.insuranceEstimate.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Patient Estimate:</Text>
            <Text style={styles.summaryValue}>${data.summary.patientEstimate.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount Paid Today:</Text>
            <Text style={styles.summaryValue}>${data.summary.amountPaid.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryTotal}>
            <Text style={styles.summaryTotalLabel}>Balance Due:</Text>
            <Text style={styles.summaryTotalValue}>${data.summary.amountDue.toFixed(2)}</Text>
          </View>
        </View>

        {/* Signature Line */}
        <View style={{ marginTop: 30 }}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Patient/Guardian Signature</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated: {new Date().toLocaleString()} | This is not a bill. Insurance will be filed on your behalf.
        </Text>
      </Page>
    </Document>
  )
}
