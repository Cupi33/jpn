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
  
  const TableDeath = () => {

    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [application, setApplication] = useState(null);
    const [error, setError] = useState(null);

    // Get appID from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const appID = queryParams.get('appID');
      
    // Define reusable styles
    // const tableCellStyle = {
    //   border: '2px solid #000',
    //   fontWeight: 700,
    //   fontSize: '1.1rem',
    //   padding: '12px'
    // };
  
    // const headerCellStyle = {
    //   ...tableCellStyle,
    //   backgroundColor: '#f8f9fa' // Light gray background for header cells
    // };


   // Fetch application details when component mounts
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        console.log("Current appID:", appID);
        const response = await axios.get(`http://localhost:5000/deathapply/deathDetails/${appID}`);
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
                        <th>Surat Sokongan</th>
                        <td>
                          {
                            application?.support_doc
                              ? <a href={`http://localhost:5000/uploads/${application.support_doc}`} target="_blank" rel="noopener noreferrer">Lihat Dokumen</a>
                              : 'Tiada dokumen'
                          }
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="d-flex justify-content-between mt-4">
                    <Link to="/adminApplication/checkDeath">
                      <Button color="secondary" style={{ fontWeight: 700 }}>Back</Button>
                    </Link>
                    <div>
                      <Button color="danger" className="mr-2" style={{ fontWeight: 700 }}>TOLAK</Button>
                      <Button color="success" style={{ fontWeight: 700 }}>TERIMA</Button>
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