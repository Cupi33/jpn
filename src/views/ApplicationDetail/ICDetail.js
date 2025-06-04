import React, { useEffect, useState } from "react";
import axios from "axios";

const ICDetails = ({ appID, statusSection }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchICDetails = async () => {
      try {
        setLoading(true);
        const endpoint = statusSection === "siapDisemak" 
          ? "/inbox/listICReview" 
          : "/inbox/listICPending";
        
        const response = await axios.post(`http://localhost:5000${endpoint}`, {
          appID: appID
        });

        if (response.data.success && response.data.data.length > 0) {
          const apiData = response.data.data[0]; // Get first item from array
          setData({
            // Application Info
            appID: apiData.APPID,
            appDate: apiData.APPDATE,
            
            // Applicant Info
            fullName: apiData.FULLNAME,
            icNumber: apiData.ICNO,
            reason: apiData.REASON,
            
            // Conditional Fields
            newAddress: apiData.NEWADDRESS || 'Tiada maklumat alamat baru',
            
            // Review Info (only for reviewed applications)
            reviewDate: statusSection === "siapDisemak" ? apiData.REVIEWDATE : null,
            decision: statusSection === "siapDisemak" ? 
              (apiData.DECISION === 'ACCEPT' ? 'TERIMA' : 'TOLAK') : null,
            comments: statusSection === "siapDisemak" ? 
              (apiData.COMMENTS || 'Tiada ulasan') : null,
            staffName: statusSection === "siapDisemak" ? apiData.STAFF_NAME : null
          });
        } else {
          setError("Tiada data ditemui untuk permohonan ini");
        }
      } catch (err) {
        console.error("Error fetching IC details:", err);
        setError("Gagal memuatkan butiran permohonan");
      } finally {
        setLoading(false);
      }
    };

    fetchICDetails();
  }, [appID, statusSection]);

  if (loading) return <p>Memuatkan butiran...</p>;
  if (error) return <p>Ralat: {error}</p>;
  if (!data) return <p>Tiada data ditemui</p>;

  return (
    <div>
      <h5>Maklumat Pemohon</h5>
      <p><strong>Nama Penuh:</strong> {data.fullName}</p>
      <p><strong>No. Kad Pengenalan:</strong> {data.icNumber}</p>
      <p><strong>Sebab Permohonan:</strong> {data.reason}</p>
      
      {/* Only show address if reason is "TUKAR ALAMAT" or if it exists */}
      {(data.reason === "TUKAR ALAMAT" || data.newAddress) && (
        <p><strong>Alamat Baru:</strong> {data.newAddress}</p>
      )}

      <h5 className="mt-4">Maklumat Permohonan</h5>
      <p><strong>ID Permohonan:</strong> {data.appID}</p>
      <p><strong>Tarikh Dihantar:</strong> {new Date(data.appDate).toLocaleDateString("ms-MY")}</p>
      
      {statusSection === "siapDisemak" && (
        <>
          <h5 className="mt-4">Maklumat Semakan</h5>
          <p><strong>Tarikh Disemak:</strong> {new Date(data.reviewDate).toLocaleDateString("ms-MY")}</p>
          <p><strong>Keputusan:</strong> {data.decision}</p>
          <p><strong>Ulasan:</strong> {data.comments}</p>
          <p><strong>Nama Pegawai:</strong> {data.staffName}</p>
        </>
      )}
    </div>
  );
};

export default ICDetails;