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

const TableIC = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

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

  const queryParams = new URLSearchParams(location.search);
  const appID = queryParams.get('appID');

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        console.log("Current appID:", appID);
        const response = await axios.get(`http://localhost:5000/icapply/getICDetails/${appID}`);
        if (response.data.success) {
          setApplication(response.data.data);
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
        `http://localhost:5000/newbornapply/document/${appID}`,
        { 
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/pdf',
          }
        }
      );

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        toast.error('Dokumen tidak dijumpai', {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error('Error fetching PDF:', err);
      toast.error('Ralat ketika memuatkan dokumen', {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleDownloadDocument = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/newbornapply/document/${appID}`, '_blank',
        { 
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/pdf',
          }
        }
      );

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `surat_laporan_polis_${appID}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        toast.error('Dokumen tidak dijumpai', {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      toast.error('Ralat ketika memuat turun dokumen', {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleReview = async (decision) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const staffID = sessionStorage.getItem('staffID');
      
      const response = await axios.post('http://localhost:5000/icapply/reviewIC', {
        appID: parseInt(appID),
        staffID: parseInt(staffID),
        decision,
        comments: comment,
        address: application.address
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
        setTimeout(() => navigate('/adminApplication/checkIC'), 3000);
      } else {
        setSubmitError(response.data.message || 'Failed to submit review');
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Server error during review submission',
        {
          position: "top-center",
          autoClose: 5000,
        }
      );
    } finally {
      setIsSubmitting(false);
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
        <Link to="/adminApplication/checkIC">
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
                <h3 className="mb-0" style={{ fontWeight: 700 }}>Semakan Permohonan Kad Pengenalan</h3>
              </CardHeader>
              <CardBody style={{ padding: '20px' }}>
                {submitError && (
                  <div className="alert alert-danger" role="alert">
                    {submitError}
                  </div>
                )}
                
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <td>Nama Pemohon</td>
                      <td>{application.full_name || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>Nombor Kad Pengenalan</td>
                      <td>{application.icno || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>Usia Pemohon</td>
                      <td>{application.age || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>Sebab Permohonan</td>
                      <td>{application.reason_desc || 'N/A'}</td>
                    </tr>
                    {application.reason === 'ha' && (
                      <tr>
                        <td>Surat Laporan Polis</td>
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
                              onClick={handleDownloadDocument}
                              disabled={isPdfLoading}
                              size="sm"
                            >
                              Download
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td>Komen</td>
                      <td>
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
                
                <hr style={{ 
                  borderTop: '2px solid #000',
                  margin: '20px 0'
                }} />
                
                <div className="d-flex justify-content-between">
                  <Link to="/adminApplication/checkIC">
                    <Button color="secondary" style={{ fontWeight: 700 }}>Back</Button>
                  </Link>
                  <div>
                    <Button 
                      color="warning" 
                      className="mr-2" 
                      style={{ fontWeight: 700 }}
                      onClick={() => handleReview('REJECT')}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Spinner size="sm" /> : 'TOLAK'}
                    </Button>
                    <Button 
                      color="success" 
                      style={{ fontWeight: 700 }}
                      onClick={() => handleReview('ACCEPT')}
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

export default TableIC;