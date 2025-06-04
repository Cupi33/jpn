import React, { useEffect, useState } from "react";

const DeathDetails = ({ appID, statusSection }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulate API delay with hardcoded data
    const mockData = {
      appID,
      deceasedName: "Mohd Sufi Bin Abdullah",
      deathDate: "2024-04-01",
      appDate: "2024-04-02",
      reviewDate: statusSection === "siapDisemak" ? "2024-04-05" : null,
      decision: statusSection === "siapDisemak" ? "TERIMA" : null,
    };

    setTimeout(() => setData(mockData), 500); // simulate delay
  }, [appID, statusSection]);

  if (!data) return <p>Memuatkan butiran...</p>;

  return (
    <>
      <p><strong>ID Permohonan:</strong> {data.appID}</p>
      <p><strong>Nama Si Mati:</strong> {data.deceasedName}</p>
      <p><strong>Tarikh Kematian:</strong> {new Date(data.deathDate).toLocaleDateString("ms-MY")}</p>
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

export default DeathDetails;
