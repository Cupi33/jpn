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

  import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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

            console.log("father id : " , fatherID);
            console.log("mother id: ",motherID);
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
                        <th>Nombor Kad Pengenalan (Ibu)</th>
                        <td>{application?.MOTHER_ICNO || 'N/A'}</td>
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
                    </tbody>
                  </table>

                  <div className="d-flex justify-content-between mt-4">
                    <Link to="/adminApplication/checkNewborn">
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