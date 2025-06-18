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
  
  const TableDeath = () => {

    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [application, setApplication] = useState(null);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const appType = "DEATH"; // initialize appType

    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(null);

    // Get appID from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const appID = queryParams.get('appID');
    
    // State for the comment section (similar to TableNewborn)
    const [selectedCommentOption, setSelectedCommentOption] = useState("");
    const [customComment, setCustomComment] = useState("");
      
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
        const response = await axios.get(`http://localhost:5000/deathapply/deathDetails/${appID}`);
        if (response.data.success) {
          setApplication(response.data.data);
          const registrantID = response.data.data.registrant_id;
          const deceasedID = response.data.data.deceased_id;

          console.log("registrant id:", registrantID );
          console.log("deceased id:", deceasedID ) 
        } else {
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
  
const handleReviewDeath = async (decision) => {
  setIsSubmitting(true);
  
  // Determine the final comment based on user selection
  const finalComment = selectedCommentOption === 'LAIN-LAIN'
      ? customComment
      : selectedCommentOption;

  // Validation: A comment is required for rejection
  if (decision === 'REJECT' && !finalComment) {
      toast.error("Sila pilih atau masukkan komen untuk menolak permohonan.", {
          position: "top-center",
          autoClose: 3000,
      });
      setIsSubmitting(false);
      return;
  }
  
  try {
    const staffID = sessionStorage.getItem('staffID');
    const response = await axios.post('http://localhost:5000/deathapply/reviewDeath', {
      appID: parseInt(appID),
      staffID: parseInt(staffID),
      decision,
      comments: finalComment, // Use the determined final comment
      deceasedID: application?.deceased_id,
      registrantID: application?.registrant_id
    });

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
      setTimeout(() => navigate('/adminApplication/checkDeath'), 3000);
    } else {
      toast.error(response.data.message || 'Permohonan gagal diproses', {
        position: "top-center",
        autoClose: 5000,
      });
    }
  } catch (err) {
    console.error("Review error:", err);
    toast.error(
      err.response?.data?.message || 'Ralat pelayan! Sila cuba lagi.',
      {
        position: "top-center",
        autoClose: 5000,
      }
    );
  } finally {
    setIsSubmitting(false);
  }
};

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
                  <h3 className="mb-0" style={{ fontWeight: 700 }}>Semakan Permohonan Pendaftaran Kematian</h3>
                </CardHeader>
                <CardBody style={{ padding: '20px' }}>
                  {/* Applicant Info */}
                  <h4 className="mb-3" style={{ fontWeight: 700 }}>Maklumat Pemohon</h4>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th width="30%">Nama Pemohon</th>
                        <td>{application?.full_name || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Nombor Kad Pengenalan</th>
                        <td>{application?.icno || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Hubungan Dengan Si Mati(Yang didaftar di borang)</th>
                        <td>{application?.relationship || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Hubungan Dengan Si Mati(Yang disemak oleh sistem)</th>
                        <td>{application?.relationship_system || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Deceased Info */}
                  <h4 className="mt-4 mb-3" style={{ fontWeight: 700 }}>Maklumat Si Mati</h4>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th width="30%">Nama Si Mati</th>
                        <td>{application?.deceased_name || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Nombor Kad Pengenalan Si Mati</th>
                        <td>{application?.deceased_icno || 'N/A'}</td>
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
                                onClick={() => window.open(`http://localhost:5000/newbornapply/document/${appID}?appType=DEATH`, '_blank')}
                                size="sm"
                              >
                                Download
                              </Button>
                            </div>
                            {pdfError && <span className="text-danger ml-2">{pdfError}</span>}
                          </td>
                        </tr>
                      {/* === UPDATED: Komen section with Dropdown and conditional Textarea === */}
                      <tr>
                        <td>Komen</td>
                        <td>
                          <Input
                            type="select"
                            value={selectedCommentOption}
                            onChange={(e) => {
                              setSelectedCommentOption(e.target.value);
                              // Clear custom comment if user switches away from "LAIN-LAIN"
                              if (e.target.value !== 'LAIN-LAIN') {
                                setCustomComment('');
                              }
                            }}
                            className="mb-2"
                          >
                            <option value="">Sila pilih komen...</option>
                            <option value="DOKUMEN TAK SAH">DOKUMEN TAK SAH</option>
                            <option value="MAKLUMAT DALAM BORANG PERMOHONAN TIDAK SAH">MAKLUMAT DALAM BORANG PERMOHONAN TIDAK SAH</option>
                            <option value="MAKLUMAT DALAM BORANG PERMOHONAN TIDAK LENGKAP">MAKLUMAT DALAM BORANG PERMOHONAN TIDAK LENGKAP</option>
                            <option value="LAIN-LAIN">LAIN-LAIN</option>
                          </Input>

                          {selectedCommentOption === 'LAIN-LAIN' && (
                            <Input
                              type="textarea"
                              value={customComment}
                              onChange={(e) => setCustomComment(e.target.value)}
                              style={{
                                width: '100%',
                                minHeight: '100px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                padding: '8px'
                              }}
                              placeholder="Sila nyatakan sebab lain di sini..."
                            />
                          )}
                        </td>
                      </tr>
                      {/* ======================================================================= */}
                    </tbody>
                  </table>

                  <hr style={{ borderTop: '2px solid #000', margin: '20px 0' }} />

                  <div className="d-flex justify-content-between">
                    <Link to="/adminApplication/checkDeath">
                      <Button color="secondary" style={{ fontWeight: 700 }}>Back</Button>
                    </Link>
                    <div>
                      <Button 
                        color="danger" 
                        className="mr-2" 
                        style={{ fontWeight: 700 }}
                        onClick={() => handleReviewDeath('REJECT')}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Spinner size="sm" /> : 'TOLAK'}
                      </Button>
                      <Button 
                        color="success" 
                        style={{ fontWeight: 700 }}
                        onClick={() => handleReviewDeath('ACCEPT')}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Spinner size="sm" /> : 'TERIMA'}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  };
  
  export default TableDeath;