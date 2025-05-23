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

const TableIC = () => {
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

export default TableIC;