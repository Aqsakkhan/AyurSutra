import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export const generatePrescriptionPDF = async (prescription) => {
  try {
    const htmlContent = `
      <html>
        <body style="font-family: Arial; padding: 20px;">

          <!-- Header -->
          <div style="text-align:center; margin-bottom: 20px;">
            <h1 style="color:#1B5E20;">AyurSutra</h1>
            <p style="color: gray;">Ayurvedic Healthcare</p>
          </div>

          <!-- Doctor + Patient Info -->
          <div style="margin-bottom: 15px;">
            <p><strong>Doctor:</strong> ${prescription.doctorName}</p>
            <p><strong>Specialization:</strong> ${prescription.doctorSpecialization || "Ayurvedic Specialist"}</p>
            <p><strong>Patient:</strong> ${prescription.patientName}</p>
            <p><strong>Date:</strong> ${
              prescription.createdAt
                ? new Date(
                    prescription.createdAt.seconds * 1000,
                  ).toLocaleDateString()
                : new Date().toLocaleDateString()
            }</p>
          </div>

          <hr />

          <!-- Diagnosis -->
          <div style="margin-top: 15px;">
            <h3 style="color:#1B5E20;">Diagnosis</h3>
            <p>${prescription.diagnosis}</p>
          </div>

          <!-- Medicines -->
          <div style="margin-top: 15px;">
            <h3 style="color:#1B5E20;">Medicines</h3>
            <ul>
              ${
                prescription.medicines
                  ? prescription.medicines
                      .split(",")
                      .map((med) => `<li>${med.trim()}</li>`)
                      .join("")
                  : "<li>No medicines prescribed</li>"
              }
            </ul>
          </div>

          <!-- Notes -->
          <div style="margin-top: 15px;">
            <h3 style="color:#1B5E20;">Notes</h3>
            <p>${prescription.notes || "No additional notes"}</p>
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px;">
            <p>Signature: ____________________</p>
          </div>

        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      alert("Sharing not available on this device");
    }
  } catch (error) {
    console.log("PDF Error:", error);
  }
};
