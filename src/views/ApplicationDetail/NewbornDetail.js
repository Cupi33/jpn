import React, { useEffect, useState } from "react";

const NewbornDetails = ({ appID, statusSection }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const mockData = {
      appID,
      babyName: "Ahmad Ziyad Bin Amir",
      birthDate: "2024-03-21",
      birthPlace: "Hospital Serdang",
      appDate: "2024-03-23",
      reviewDate: statusSection === "siapDisemak" ? "2024-03-26" : null,
      decision: statusSection === "siapDisemak" ? "TERIMA" : null,
    };

    setTimeout(() => setData(mockData), 500);
  }, [appID, statusSection]);

  if (!data) return <p>Memuatkan butiran...</p>;

  return (
    <>
      <p><strong>ID Permohonan:</strong> {data.appID}</p>
      <p><strong>Nama Bayi:</strong> {data.babyName}</p>
      <p><strong>Tarikh Lahir:</strong> {new Date(data.birthDate).toLocaleDateString("ms-MY")}</p>
      <p><strong>Tempat Lahir:</strong> {data.birthPlace}</p>
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

export default NewbornDetails;
