import React, { useEffect, useState } from "react";
import axios from "axios";

const NewbornDetails = ({ appID, statusSection }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewbornDetails = async () => {
      try {
        setLoading(true);
        const endpoint = statusSection === "siapDisemak" 
          ? "/inbox/listNewbornReview" 
          : "/inbox/listNewbornPending";
        
        const response = await axios.post(`http://localhost:5000${endpoint}`, {
          appID: appID
        });

        if (response.data.success && response.data.data.length > 0) {
          const apiData = response.data.data[0]; // Get first item from array
          setData({
            // Application Info
            appID: apiData.APPID,
            appDate: apiData.APPDATE,
            
            // Registrant Info
            registName: apiData.REGIST_FULLNAME,
            registIC: apiData.REGIST_ICNO,
            
            // Parent Info
            fatherName: apiData.FATHER_FULLNAME,
            fatherIC: apiData.FATHER_ICNO,
            motherName: apiData.MOTHER_FULLNAME,
            motherIC: apiData.MOTHER_ICNO,
            marriageStatus: apiData.STATUS_MARRIAGE,
            
            // Baby Info
            babyName: apiData.BABY_NAME,
            babyGender: apiData.BABY_GENDER,
            babyDOB: apiData.BABY_DOB,
            babyReligion: apiData.BABY_RELIGION,
            babyRace: apiData.BABY_RACE,
            babyAddress: apiData.BABY_ADDRESS,
            
            // Review Info (only for reviewed applications)
            reviewDate: statusSection === "siapDisemak" ? apiData.REVIEW_DATE : null,
            decision: statusSection === "siapDisemak" ? 
              (apiData.DECISION === 'ACCEPT' ? 'TERIMA' : 'TOLAK') : null,
            comments: statusSection === "siapDisemak" ? 
              (apiData.COMMENTS || 'Tiada ulasan') : null,
            staffName: statusSection === "siapDisemak" ? apiData.STAFF_FULLNAME : null
          });
        } else {
          setError("Tiada data ditemui untuk permohonan ini");
        }
      } catch (err) {
        console.error("Error fetching newborn details:", err);
        setError("Gagal memuatkan butiran permohonan");
      } finally {
        setLoading(false);
      }
    };

    fetchNewbornDetails();
  }, [appID, statusSection]);

  if (loading) return <p>Memuatkan butiran...</p>;
  if (error) return <p>Ralat: {error}</p>;
  if (!data) return <p>Tiada data ditemui</p>;

  return (
    <div>
      <h5>Maklumat Pendaftar</h5>
      <p><strong>Nama Pendaftar:</strong> {data.registName}</p>
      <p><strong>No. Kad Pengenalan:</strong> {data.registIC}</p>
      
      <h5 className="mt-4">Maklumat Ibu Bapa</h5>
      <p><strong>Nama Bapa:</strong> {data.fatherName}</p>
      <p><strong>No. Kad Pengenalan Bapa:</strong> {data.fatherIC}</p>
      <p><strong>Nama Ibu:</strong> {data.motherName}</p>
      <p><strong>No. Kad Pengenalan Ibu:</strong> {data.motherIC}</p>
      <p><strong>Status Perkahwinan:</strong> {data.marriageStatus}</p>
      
      <h5 className="mt-4">Maklumat Bayi</h5>
      <p><strong>Nama Bayi:</strong> {data.babyName}</p>
      <p><strong>Jantina:</strong> {data.babyGender}</p>
      <p><strong>Tarikh Lahir:</strong> {new Date(data.babyDOB).toLocaleDateString("ms-MY")}</p>
      <p><strong>Agama:</strong> {data.babyReligion}</p>
      <p><strong>Bangsa:</strong> {data.babyRace}</p>
      <p><strong>Alamat:</strong> {data.babyAddress}</p>
      
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

export default NewbornDetails;