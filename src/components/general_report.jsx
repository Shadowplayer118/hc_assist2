import React, { useEffect, useState } from "react";
import axios from "axios";

const months = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear - i); // Last 6 years

const GeneralReport = () => {
  const [report, setReport] = useState(null);
  const [newReport, setNewReport] = useState(null); // New dataset state
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(5, 7)
  );
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const fetchReport = async (month, year) => {
    try {
      const { data } = await axios.get(
        `http://localhost/hc_assist2/src/zbackend_folder/load_gen_report.php?month=${month}&year=${year}`
      );
      setReport(data);
    } catch (error) {
      console.error("Error fetching report:", error);
    }
  };

  // Fetch the new dataset
const fetchNewReport = async (month, year) => {
  try {
    const { data } = await axios.get(
      `http://localhost/hc_assist2/src/zbackend_folder/load_monthly_report.php?month=${month}&year=${year}`
    );
    setNewReport(data);
  } catch (error) {
    console.error("Error fetching new report:", error);
  }
};


const generateReport = () => {
  const printWindow = window.open("", "_blank");
  printWindow.document.write("<html><head><title>Report</title></head><body>");
  
  // Title and month
  printWindow.document.write("<h1 style='text-align:center;'>Monthly Report</h1>");
  printWindow.document.write(`<h3 style='text-align:center;'>For the month of ${months.find(m => m.value === selectedMonth).label} ${selectedYear}</h3>`);
  printWindow.document.write("<hr>");

  printWindow.document.write("<h2>General Report</h2>");
  printWindow.document.write("<table border='1' style='width:100%; border-collapse: collapse;'>");
  printWindow.document.write("<thead><tr><th>Category</th><th>Count</th><th>Percentage</th></tr></thead>");
  printWindow.document.write("<tbody>");

  if (report) {
    ["referrals", "pregnant", "disease", "immunization", "Children", "Total"].forEach((key) => {
      printWindow.document.write(`<tr><td>${key}</td><td>${report[key].count}</td><td>${report[key].percentage}%</td></tr>`);
    });
  }

  printWindow.document.write("</tbody></table>");

  if (newReport) {
    printWindow.document.write("<h2>Additional Report</h2>");
    printWindow.document.write("<table border='1' style='width:100%; border-collapse: collapse;'>");
    printWindow.document.write("<thead><tr><th>Category</th><th>Details</th></tr></thead>");
    printWindow.document.write("<tbody>");

    // General section
    printWindow.document.write("<tr><td>General</td><td>Total: " + newReport.general.total + ", Male: " + newReport.general.male + ", Female: " + newReport.general.female + "</td></tr>");

    // Children section
    printWindow.document.write("<tr><td>Children</td><td>Total: " + newReport.children.total + ", Male: " + newReport.children.male + ", Female: " + newReport.children.female + "</td></tr>");

    // Senior section
    printWindow.document.write("<tr><td>Senior</td><td>Total: " + newReport.senior.total + ", Male: " + newReport.senior.male + ", Female: " + newReport.senior.female + "</td></tr>");

    // Pregnant section
    printWindow.document.write("<tr><td>Pregnant</td><td>Total: " + newReport.pregnant.total + ", Miscarried: " + newReport.pregnant.miscarried + ", Delivered: " + newReport.pregnant.delivered + "</td></tr>");

    // Disease section
    newReport.disease.forEach((disease) => {
      printWindow.document.write(`<tr><td>Disease: ${disease.disease_name}</td><td>Cured: ${disease.cured}, Ongoing: ${disease.ongoing}</td></tr>`);
    });

    // Immunization section
    newReport.immunization.forEach((immunization) => {
      printWindow.document.write(`<tr><td>Immunization: ${immunization.immu_name}</td><td>Total: ${immunization.total}</td></tr>`);
    });

    printWindow.document.write("</tbody></table>");
  }

  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.print();
};


  useEffect(() => {
    fetchReport(selectedMonth, selectedYear);
    fetchNewReport(); // Fetch new report on mount
  }, [selectedMonth, selectedYear]);

  return (
    <div className="p-6 bg-white shadow rounded-xl max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">General Report</h2>

      <div className="flex gap-4 mb-4">
        <div>
          <label className="font-medium mr-2">Select Month:</label>
          <select
            className="border px-3 py-1 rounded"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium mr-2">Select Year:</label>
          <select
            className="border px-3 py-1 rounded"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {report ? (
        <>
          <table className="w-full border mt-4">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Count</th>
                <th className="p-2 border">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {["referrals", "pregnant", "disease", "immunization", "Children", "Total"].map(
                (key) => (
                  <tr key={key}>
                    <td className="p-2 border capitalize">{key}</td>
                    <td className="p-2 border">{report[key].count}</td>
                    <td className="p-2 border">{report[key].percentage}%</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          <button
            onClick={generateReport}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          >
            Generate Report
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}

      {/* Optionally display new report data */}
      {newReport && (
        <div className="mt-6">
          <h3 className="text-xl font-bold">Additional Report Data</h3>
          <div>
            {/* Display general, children, senior, pregnant, etc., data as needed */}
            <p>General Total: {newReport.general.total}</p>
            <p>Children Total: {newReport.children.total}</p>
            <p>Senior Total: {newReport.senior.total}</p>
            {/* Other data sections can be displayed here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralReport;
