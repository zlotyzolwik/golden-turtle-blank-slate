import jsPDF from 'jspdf';

export interface ParticipantData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  numberOfPeople: number;
  totalPrice: number;
  paymentStatus: string;
  createdAt: string;
}

export interface TripPDFData {
  tripTitle: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  participants: ParticipantData[];
  totalRevenue: number;
  totalParticipants: number;
  paidParticipants: number;
}

export const generateTripParticipantsPDF = (tripData: TripPDFData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 30;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Lista uczestników', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(16);
  doc.text(tripData.tripTitle, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Kierunek: ${tripData.destination}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 6;
  doc.text(`Data: ${tripData.departureDate} - ${tripData.returnDate}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;

  // Summary stats
  doc.setFont('helvetica', 'bold');
  doc.text('Podsumowanie:', margin, yPosition);
  yPosition += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Łączna liczba uczestników: ${tripData.totalParticipants}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Opłaceni uczestnicy: ${tripData.paidParticipants}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Łączny przychód: ${tripData.totalRevenue.toFixed(2)} PLN`, margin, yPosition);
  yPosition += 15;

  // Participants table header
  doc.setFont('helvetica', 'bold');
  doc.text('Lista uczestników:', margin, yPosition);
  yPosition += 10;

  // Table headers
  const headers = ['Imię i nazwisko', 'Email', 'Telefon', 'Osoby', 'Cena', 'Status', 'Data rez.'];
  const columnWidths = [40, 45, 25, 15, 20, 25, 25];
  let xPosition = margin;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  headers.forEach((header, index) => {
    doc.text(header, xPosition, yPosition);
    xPosition += columnWidths[index];
  });
  
  yPosition += 5;
  
  // Draw line under headers
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Participants data
  doc.setFont('helvetica', 'normal');
  
  tripData.participants.forEach((participant, index) => {
    if (yPosition > 270) { // New page if needed
      doc.addPage();
      yPosition = 30;
    }

    xPosition = margin;
    const rowData = [
      participant.customerName,
      participant.customerEmail,
      participant.customerPhone || 'Brak',
      participant.numberOfPeople.toString(),
      `${participant.totalPrice.toFixed(2)} PLN`,
      participant.paymentStatus === 'paid' ? 'Opłacona' : 'Nieopłacona',
      new Date(participant.createdAt).toLocaleDateString('pl-PL')
    ];

    rowData.forEach((data, cellIndex) => {
      doc.text(data, xPosition, yPosition, { 
        maxWidth: columnWidths[cellIndex] - 2 
      });
      xPosition += columnWidths[cellIndex];
    });

    yPosition += 8;

    // Alternate row background (light gray)
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yPosition - 6, pageWidth - 2 * margin, 6, 'F');
    }
  });

  // Footer
  const currentDate = new Date().toLocaleDateString('pl-PL');
  doc.setFontSize(8);
  doc.text(`Wygenerowano: ${currentDate}`, margin, doc.internal.pageSize.getHeight() - 10);
  doc.text('Złoty Żółwik - Biuro Podróży', pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });

  // Download the PDF
  const fileName = `uczestnicy_${tripData.tripTitle.replace(/\s+/g, '_')}_${currentDate.replace(/\./g, '_')}.pdf`;
  doc.save(fileName);
};

export const generateFinancialReportPDF = (reportData: any): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 30;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Raport Finansowy', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Okres: ${reportData.period}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;

  // Financial summary
  doc.setFont('helvetica', 'bold');
  doc.text('Podsumowanie finansowe:', margin, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Przychody z wycieczek: ${reportData.tripRevenue.toFixed(2)} PLN`, margin, yPosition);
  yPosition += 6;
  doc.text(`Przychody z voucherów: ${reportData.voucherRevenue.toFixed(2)} PLN`, margin, yPosition);
  yPosition += 6;
  doc.text(`Łączne przychody: ${reportData.totalRevenue.toFixed(2)} PLN`, margin, yPosition);
  yPosition += 15;

  // Top trips
  if (reportData.topTrips && reportData.topTrips.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Najpopularniejsze wycieczki:', margin, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    reportData.topTrips.forEach((trip: any, index: number) => {
      doc.text(`${index + 1}. ${trip.title} - ${trip.revenue.toFixed(2)} PLN (${trip.participants} uczestników)`, margin, yPosition);
      yPosition += 6;
    });
  }

  // Download the PDF
  const currentDate = new Date().toLocaleDateString('pl-PL');
  const fileName = `raport_finansowy_${currentDate.replace(/\./g, '_')}.pdf`;
  doc.save(fileName);
};