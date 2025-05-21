// reactstrap components
import { Link , useNavigate} from "react-router-dom";
import {
    Card,
    Badge,
    Container,
    Row,
    Table,
    CardHeader,
    Button
  } from "reactstrap";
  // core components
import { useEffect, useState } from "react";
import axios from "axios";
  
  const NewbornCheck = () => {

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [applications, setApplications] = useState([]);

    //first useeffect is for checking the staffID
  useEffect(() => {
    const storedStaffID = sessionStorage.getItem('staffID');
    const storedUsername = sessionStorage.getItem('username');

    if (storedStaffID && storedUsername) {
      setIsLoading(false);
    } else {
      navigate('/authAdmin/loginAdmin');
    }
  }, [navigate]);


  //second useEffect is to fetch the newborn applications from the api
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        //call backend api to get newborn applications
        const response = await axios.get("http://localhost:5000/newbornapply/tableNewborn");
        if (response.data.success) {
          setApplications(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    fetchApplications();
  }, []);

  if (isLoading) {
    return (
      <Container className="mt-5 text-center">
        <h4>Loading...</h4>
      </Container>
    );
  }

    return (
      <>
        {/* Page content */}
        <Container className="mt--7" fluid>
  
        <Row className="mt-5">
          <div className="col">
            <Card className="bg-default shadow">
              <CardHeader className="bg-transparent border-0">
                <h3 className="text-white mb-0">Semakan Permohonan Pendaftaran Bayi</h3>
              </CardHeader>
              <Table
                className="align-items-center table-light table-flush"
                responsive
              >
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Nombor</th>
                    <th scope="col">Nombor IC Pendaftar</th>
                    <th scope="col">Status</th>
                    <th scope="col">Tarikh Hantar Pendaftaran</th>
                    <th scope="col">Semak</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                {applications.map((app, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td> {/* Display row number */}
                    <td>{app.icno}</td> {/* Display IC number */}
                    <td>
                      <Badge color="" className="badge-dot mr-4">
                        <i className="bg-warning" />
                        {app.status} {/* Display status like "PENDING" */}
                      </Badge>
                    </td>
                    <td>{new Date(app.appDate).toLocaleDateString("ms-MY")}</td> {/* Format date */}
                    <td>
                      <Link to={`/adminApplication/tableNewborn?appID=${app.appID}`}>
                        <Button type="button" color="primary">
                          Semak
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              </Table>
            </Card>
          </div>
        </Row>
        </Container>
      </>
    );
  };
  
  export default NewbornCheck;
  