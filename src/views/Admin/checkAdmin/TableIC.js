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

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const TableIC = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [comment, setComment] = useState(""); // State for comment input
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit loading
  const [submitError, setSubmitError] = useState(null); // State for submit errors

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

  // Get appID from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const appID = queryParams.get('appID');

  // Define reusable styles
  const tableCellStyle = {
    border: '2px solid #000',
    fontWeight: 700,
    fontSize: '1.1rem',
    padding: '12px'
  };

  const headerCellStyle = {
    ...tableCellStyle,
    backgroundColor: '#f8f9fa'
  };

  // Fetch application details when component mounts
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
        address: application.address // This might be null for some cases
      });

      if (response.data.success) {
        // Show success message and redirect back
        alert(response.data.message);
        navigate('/adminApplication/checkIC');
      } else {
        setSubmitError(response.data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error("Review submission error:", err);
      setSubmitError(err.response?.data?.message || 'Server error during review submission');
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
                
                <table style={{ 
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '2px solid #000'
                }}>
                  <tbody>
                    <tr>
                      <td style={headerCellStyle} width="30%">Nama Pemohon</td>
                      <td style={tableCellStyle}>{application.full_name || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style={headerCellStyle}>Nombor Kad Pengenalan</td>
                      <td style={tableCellStyle}>{application.icno || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style={headerCellStyle}>Sebab Permohonan</td>
                      <td style={tableCellStyle}>{application.reason_desc || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style={headerCellStyle}>Surat Sokongan</td>
                      <td style={tableCellStyle}></td>
                    </tr>
                    <tr>
                      <td style={headerCellStyle}>Komen</td>
                      <td style={tableCellStyle}>
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