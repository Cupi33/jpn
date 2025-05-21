// reactstrap components
import {
    Card,
    Container,
    Row,
    Col,
    CardBody,
    CardHeader,
    Button,
    Spinner
  } from "reactstrap";

  import { Link, useLocation } from "react-router-dom";
  import { useEffect, useState } from "react";
  import axios from "axios";
  
  const TableNewborn = () => {

    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [application, setApplication] = useState(null);
    const [error, setError] = useState(null);

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
      backgroundColor: '#f8f9fa' // Light gray background for header cells
    };
  
    // Fetch application details when component mounts
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        console.log("Current appID:", appID);
        const response = await axios.get(`http://localhost:5000/newbornapply/newbornDetail/${appID}`);
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
        <Container className="mt--7" fluid>
          <Row className="mt-5">
            <Col md="12">
              <Card>
                <CardHeader>
                  <h3 className="mb-0" style={{ fontWeight: 700 }}>Semakan Permohonan Pendaftaran Bayi</h3>
                </CardHeader>
                <CardBody style={{ padding: '20px' }}>
                  <table style={{ 
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '2px solid #000'
                  }}>
                    <tbody>
                      <tr>
                        <td style={headerCellStyle} width="30%">Nama Pemohon(Bapa)</td>
                        <td style={tableCellStyle}>{application?.FATHER_NAME || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={headerCellStyle}>Nombor Kad Pengenalan(Bapa)</td>
                        <td style={tableCellStyle}>{application.FATHER_ICNO || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={headerCellStyle}>Nama Pemohon(Ibu)</td>
                        <td style={tableCellStyle}>{application.MOTHER_NAME || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={headerCellStyle}>Nombor Kad Pengenalan(Ibu)</td>
                        <td style={tableCellStyle}>{application.MOTHER_ICNO|| 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={headerCellStyle}>Nama Bayi</td>
                        <td style={tableCellStyle}>{application.BABY_NAME|| 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={headerCellStyle}>Jantina Bayi</td>
                        <td style={tableCellStyle}>{application.GENDER|| 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={headerCellStyle}>Tarikh Lahir Bayi</td>
                        <td style={tableCellStyle}>{application.DOB|| 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={headerCellStyle}>Agama Bayi</td>
                        <td style={tableCellStyle}>{application.BABY_NAME|| 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={headerCellStyle}>Bangsa Bayi</td>
                        <td style={tableCellStyle}>{application.RACE|| 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={headerCellStyle}>Alamat Bayi</td>
                        <td style={tableCellStyle}>{application.ADDRESS|| 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <hr style={{ 
                    borderTop: '2px solid #000',
                    margin: '20px 0'
                  }} />
                  
                  <div className="d-flex justify-content-between">
                    <Link to = "/adminApplication/checkNewborn">
                    <Button color="secondary" style={{ fontWeight: 700 }}>Back</Button>
                    </Link>
                    <div>
                      <Button color="warning" className="mr-2" style={{ fontWeight: 700 }}>Reset</Button>
                      <Button color="success" style={{ fontWeight: 700 }}>Accept</Button>
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
  
  export default TableNewborn;