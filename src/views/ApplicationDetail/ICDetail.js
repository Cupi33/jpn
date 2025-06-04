import React, { useEffect, useState } from "react";

const ICDetails = ({ appID, statusSection }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulated hardcoded data
    const mockData = {
      appID,
      applicantName: "Aminah Binti Salleh",
      icType: "Kad Pengenalan Warganegara",
      appDate: "2024-05-10",
      reviewDate: statusSection === "siapDisemak" ? "2024-05-15" : null,
      decision: statusSection === "siapDisemak" ? "TOLAK" : null,
    };

    setTimeout(() => setData(mockData), 500); // simulate loading delay
  }, [appID, statusSection]);

  if (!data) return <p>Memuatkan butiran...</p>;

  return (
    <>
      <p><strong>ID Permohonan:</strong> {data.appID}</p>
      <p><strong>Nama Pemohon:</strong> {data.applicantName}</p>
      <p><strong>Jenis IC:</strong> {data.icType}</p>
      <p><strong>Tarikh Dihantar:</strong> {new Date(data.appDate).toLocaleDateString("ms-MY")}</p>
      {data.reviewDate && (
        <p><strong>Tarikh Disemak:</strong> {new Date(data.reviewDate).toLocaleDateString("ms-MY")}</p>
      )}
      {data.decision && (
        <p><strong>Keputusan:</strong> {data.decision}</p>
      )}
    </>
  );
};

export default ICDetails;
