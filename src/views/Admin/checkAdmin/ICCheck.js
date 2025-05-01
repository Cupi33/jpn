// reactstrap components
import { Link } from "react-router-dom";
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
//   import { Link } from "react-router-dom";
  
  const ICCheck = () => {
    return (
      <>
        {/* Page content */}
        <Container className="mt--7" fluid>
  
        <Row className="mt-5">
          <div className="col">
            <Card className="bg-default shadow">
              <CardHeader className="bg-transparent border-0">
                <h3 className="text-white mb-0">Semakan Permohonan Kad Pengenalan</h3>
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
                  <tr>
                    <td >
                      1
                    </td>
                    <td>030421140333</td>
                    <td>
                      <Badge color="" className="badge-dot mr-4">
                        <i className="bg-warning" />
                        Pending
                      </Badge>
                    </td>
                    <td>
                      22/4/2025  
                    </td>
                    <td>
                        <Link to= "/adminApplication/tableIC">
                            <Button type="button" color="primary">
                                Semak
                            </Button>
                        </Link>                       
                    </td>
                  </tr>
                  <tr>

                  </tr>
                </tbody>
              </Table>
            </Card>
          </div>
        </Row>
        </Container>
      </>
    );
  };
  
  export default ICCheck;
  