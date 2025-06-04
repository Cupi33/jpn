import React, { useEffect, useState } from "react";
import axios from "axios";

const DeathDetails = ({ appID, statusSection }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeathDetails = async () => {
      try {
        setLoading(true);
        const endpoint = statusSection === "siapDisemak" 
          ? "/inbox/listDeathReview" 
          : "/inbox/listDeathPending";
        
        const response = await axios.post(`http://localhost:5000${endpoint}`, {
          appID: appID
        });

        if (response.data.success && response.data.data.length > 0) {
          const apiData = response.data.data[0]; // Get first item from array
          setData({
            appID: apiData.APPID,
            registName: apiData.REGIST_NAME,
            registIC: apiData.REGIST_ICNO,
            deceasedName: apiData.DECEASE_NAME,
            deceasedIC: apiData.DECEASE_ICNO,
            relationship: apiData.REGISTER_RELATIONSHIP,
            systemRelationship: apiData.SYSTEM_RELATIONSHIP,
            appDate: apiData.APPDATE,
            reviewDate: statusSection === "siapDisemak" ? apiData.REVIEWDATE : null,
            decision: statusSection === "siapDisemak" ? 
              (apiData.DECISION === 'ACCEPT' ? 'TERIMA' : 'TOLAK') : null,
            comments: statusSection === "siapDisemak" ? 
              (apiData.COMMENTS || 'Tiada ulasan') : null,
            staffName: statusSection === "siapDisemak" ? apiData.STAFFNAME : null
          });
        } else {
          setError("No data available for this application");
        }
      } catch (err) {
        console.error("Error fetching death details:", err);
        setError("Failed to load application details");
      } finally {
        setLoading(false);
      }
    };

    fetchDeathDetails();
  }, [appID, statusSection]);

  if (loading) return <p>Memuatkan butiran...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>Tiada data ditemui</p>;

  return (
    <div>
      <h5>Maklumat Pendaftar</h5>
      <p><strong>Nama Pendaftar:</strong> {data.registName}</p>
      <p><strong>No. Kad Pengenalan:</strong> {data.registIC}</p>
      <p><strong>Hubungan dengan Si Mati:</strong> {data.relationship}</p>
      <p><strong>Hubungan Sistem:</strong> {data.systemRelationship}</p>
      
      <h5 className="mt-4">Maklumat Si Mati</h5>
      <p><strong>Nama Si Mati:</strong> {data.deceasedName}</p>
      <p><strong>No. Kad Pengenalan:</strong> {data.deceasedIC}</p>
      
      <h5 className="mt-4">Maklumat Permohonan</h5>
      <p><strong>ID Permohonan:</strong> {data.appID}</p>
      <p><strong>Tarikh Dihantar:</strong> {new Date(data.appDate).toLocaleDateString("ms-MY")}</p>
      
      {statusSection === "siapDisemak" && (
        <>
          <p><strong>Tarikh Disemak:</strong> {new Date(data.reviewDate).toLocaleDateString("ms-MY")}</p>
          <p><strong>Keputusan:</strong> {data.decision}</p>
          {data.comments && <p><strong>Ulasan:</strong> {data.comments}</p>}
          <p><strong>Nama Pegawai:</strong> {data.staffName}</p>
        </>
      )}
    </div>
  );
};

export default DeathDetails;