// reactstrap components
import {
    Card,
    Container,
    Row,
    Col,
    CardBody,
    CardHeader,
    Button,
    Spinner,
    Input
  } from "reactstrap";


  import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
  import { Link, useLocation, useNavigate } from "react-router-dom";
  import { useEffect, useState } from "react";
  import axios from "axios";
  
  const TableNewborn = () => {

    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [application, setApplication] = useState(null);
    const [error, setError] = useState(null);
    const appType = "NEWBORN"; // initialize appType


const [isPdfLoading, setIsPdfLoading] = useState(false);
const [pdfError, setPdfError] = useState(null);

    // Get appID from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const appID = queryParams.get('appID');
  const navigate = useNavigate();
  const [comment, setComment] = useState("");

  //stored staffID and username
  useEffect(() => {
    const storedStaffID = sessionStorage.getItem('staffID');
    const storedUsername = sessionStorage.getItem('username');

    if (storedStaffID && storedUsername) {
      console.log("staffid :", storedStaffID);
      console.log("username :", storedUsername);
      setIsLoading(false);
    } else {
      navigate('/authAdmin/loginAdmin');
    }
  }, [navigate]);
  
    // Fetch application details when component mounts
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        console.log("Current appID:", appID);
        const response = await axios.get(`http://localhost:5000/newbornapply/newbornDetail/${appID}`);
        if (response.data.success)
           {
            setApplication(response.data.data);
            const fatherID = response.data.data.FATHERID;
            const motherID = response.data.data.MOTHERID;
            const registrantID = response.data.data.REGISTRANTID;

            console.log("father id : " , fatherID);
            console.log("mother id: ",motherID);
            console.log("registrant id:", registrantID ) 
           }
         else {
          setError('Failed to fetch application details');
        }
      } catch (err) {
        console.error("Error fetching application details:", err);
        setError('Error fetching application details');
      } finally {
        setIsLoading(false);
      }
    };
    if (appID) {
      fetchApplicationDetails();
    } else {
      setError('No application ID provided');
      setIsLoading(false);
    }
  }, [appID]);

const handleViewDocument = async () => {
  setIsPdfLoading(true);
  setPdfError(null);

  try {
    const response = await axios.get(
      `http://localhost:5000/newbornapply/document/${appID}?appType=${appType}`,
      { responseType: 'blob', validateStatus: false } // 👈 this is important
    );

    // Handle 404 manually
    if (response.status === 404) {
      toast.warning('Dokumen Tidak Dijumpai', {
        position: "top-center",
        autoClose: 3000,
      });
      return; // stop further execution
    }

    // If other errors, or empty blob
    if (!response.data || response.data.size === 0) {
      toast.warning('Dokumen Tidak Dijumpai', {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

  } catch (err) {
    console.error('Error fetching PDF:', err);
    toast.error('Ralat ketika memuatkan dokumen.', {
      position: "top-center",
      autoClose: 3000,
    });
  } finally {
    setIsPdfLoading(false);
  }
};


  const handleReviewNewborn = async (decision) => {
    const staffID = sessionStorage.getItem("staffID");

    const payload = {
      appID: appID,
      staffID: parseInt(staffID),
      decision: decision,
      comments: comment || null,
      fullname: application?.BABY_NAME,
      dob: application?.DOB,
      registrantID: application?.REGISTRANTID,
      gender: application?.GENDER,
      race: application?.RACE,
      religion: application?.RELIGION,
      address: application?.ADDRESS || null,
      status_marriage: application?.STATUS_MARRIAGE,
      fatherID: application?.FATHERID,
      motherID: application?.MOTHERID,
    };

    try {
      const response = await axios.post("http://localhost:5000/newbornapply/reviewNewborn", payload);
      if (response.data.success) {
        toast.success(
          decision === 'ACCEPT' 
            ? 'Permohonan diterima!' 
            : 'Permohonan ditolak!', 
          {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
        setTimeout(() => navigate("/adminApplication/checkNewborn"), 3000);
      } else {
        toast.error(response.data.message || 'Permohonan gagal diproses', {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Error reviewing newborn application:", error);
      toast.error("Ralat pelayan! Sila cuba lagi.", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner color="primary" />
        <h4>Loading application details...</h4>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 text-center">
        <h4 className="text-danger">{error}</h4>
        <Link to="/adminApplication/checkNewborn">
          <Button color="secondary" style={{ fontWeight: 700 }} className="mt-3">Back</Button>
        </Link>
      </Container>
    );
  }

  if (!application) {
    return (
      <Container className="mt-5 text-center">
        <h4>No application data found</h4>
        <Link to="/adminApplication/checkIC">
          <Button color="secondary" style={{ fontWeight: 700 }} className="mt-3">Back</Button>
        </Link>
      </Container>
    );
  }

    return (
      <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

        <Container className="mt--7" fluid>
          <Row className="mt-5">
            <Col md="12">
              <Card>
                <CardHeader>
                  <h3 className="mb-0" style={{ fontWeight: 700 }}>Semakan Permohonan Pendaftaran Bayi</h3>
                </CardHeader>
                <CardBody style={{ padding: '20px' }}>

                  {/* Registrant Info */}
                  <h4 className="mb-3" style={{ fontWeight: 700 }}>Maklumat Pemohon</h4>
                  <table className="table table-bordered">
                    <tr>
                        <th width="30%">Nama Pendaftar</th>
                        <td>{application?.REGISTRANT_NAME || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th width="30%">Nombor Kad Pengenalan Pendaftar</th>
                        <td>{application?.REGISTRANT_ICNO || 'N/A'}</td>
                    </tr>
                  </table>

                  {/* Parent Info */}
                  <h4 className="mb-3" style={{ fontWeight: 700 }}>Maklumat Ibu Bapa</h4>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th width="30%">Nama Pemohon (Bapa)</th>
                        <td>{application?.FATHER_NAME || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Nombor Kad Pengenalan (Bapa)</th>
                        <td>{application?.FATHER_ICNO || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Nama Pemohon (Ibu)</th>
                        <td>{application?.MOTHER_NAME || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Nombor Kad Pengenalan (Ibu)</th>
                        <td>{application?.MOTHER_ICNO || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Agama (Bapa)</th>
                        <td>{application?.FATHER_RELIGION || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Agama (Ibu)</th>
                        <td>{application?.MOTHER_RELIGION || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Bangsa (Bapa)</th>
                        <td>{application?.FATHER_RACE || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Bangsa (Ibu)</th>
                        <td>{application?.MOTHER_RACE || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>ALAMAT (Bapa)</th>
                        <td>{application?.FATHER_ADDRESS || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>ALAMAT (Ibu)</th>
                        <td>{application?.MOTHER_ADDRESS || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>STATUS PERKAHWINAN IBU DAN BAPA</th>
                        <td>{application?.STATUS_MARRIAGE || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Baby Info */}
                  <h4 className="mt-4 mb-3" style={{ fontWeight: 700 }}>Maklumat Bayi</h4>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th width="30%">Nama Bayi</th>
                        <td>{application?.BABY_NAME || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Jantina Bayi</th>
                        <td>{application?.GENDER || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Tarikh Lahir Bayi</th>
                        <td>{application?.DOB || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Agama Bayi</th>
                        <td>{application?.RELIGION || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Bangsa Bayi</th>
                        <td>{application?.RACE || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Alamat Bayi</th>
                        <td>{application?.ADDRESS || 'N/A'}</td>
                      </tr>
                        <tr>
                          <td>Surat Sokongan</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button 
                                color="primary" 
                                onClick={handleViewDocument}
                                disabled={isPdfLoading}
                                size="sm"
                              >
                                {isPdfLoading ? (
                                  <>
                                    <Spinner size="sm" /> Loading...
                                  </>
                                ) : (
                                  'View Document'
                                )}
                              </Button>
                              <Button 
                                color="secondary" 
                                onClick={() => window.open(`http://localhost:5000/newbornapply/document/${appID}?appType=${appType}`, '_blank')}
                                size="sm"
                              >
                                Download
                              </Button>
                            </div>
                            {pdfError && <span className="text-danger ml-2">{pdfError}</span>}
                          </td>
                        </tr>
                      <tr>
                      <td >Komen</td>
                      <td >
                        <Input
                          type="textarea"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          style={{
                            width: '100%',
                            minHeight: '100px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            padding: '8px'
                          }}
                          placeholder="Masukkan komen anda di sini..."
                        />
                      </td>
                    </tr>
                    </tbody>
                  </table>
                  <div>
                      <Button
                        color="danger"
                        className="mr-2"
                        style={{ fontWeight: 700 }}
                        onClick={() => handleReviewNewborn("REJECT")}
                      >
                        TOLAK
                      </Button>
                      <Button
                        color="success"
                        style={{ fontWeight: 700 }}
                        onClick={() => handleReviewNewborn("ACCEPT")}
                      >
                        TERIMA
                      </Button>
                    </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  };
  
  export default TableNewborn;