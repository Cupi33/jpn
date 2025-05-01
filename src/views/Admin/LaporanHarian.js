
// reactstrap components
import {
  Card,
  CardHeader,
  Table,
  Container,
  Row,
  Col,
} from "reactstrap";

// core components


import AdminHeader from "components/Headers/AdminHeader";

const LaporanHarian = (props) => {
  return (
    <>
      <AdminHeader />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row className="mt-5">
          {/* {untuk able first page visits} */}
          <Col className="mb-5 mb-xl-0" xl="8">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Semakan Permohonan Oleh Staff(HARI INI)</h3>
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Jenis Permohonan</th>
                    <th scope="col">Jumlah(Untuk Hari ini)</th>
                    <th scope="col">Disemak(Untuk Hari ini)</th>
                    <th scope="col">Terima</th>
                    <th scope="col">Tolak</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Bayi</th>
                    <td>4</td>
                    <td>3</td>
                    <td>1</td>
                    <td> 2</td>
                  </tr>
                  <tr>
                    <th scope="row">Kematian</th>
                    <td>5</td>
                    <td>3</td>
                    <td>0</td>
                    <td> 3</td>
                  </tr>
                  <tr>
                    <th scope="row">Kad Pengenalan</th>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </Col>
          </Row>

         <Row className="mt-4">
         <Col xl="6">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Sejarah Semakan Permohonan Oleh Staff</h3>
                  </div>
                </Row>
              </CardHeader>
              {/* {untuk table social traffic} */}
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                <tr>
                    <th scope="col">Jenis Permohonan</th>
                    <th scope="col">Jumlah Disemak</th>
                    <th scope="col">Terima</th>
                    <th scope="col">Tolak</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Bayi</th>
                    <td>4</td>
                    <td>3</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <th scope="row">Kematian</th>
                    <td>5</td>
                    <td>3</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <th scope="row">Kad Pengenalan</th>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </Col>
         </Row>
        
      </Container>
    </>
  );
};

export default LaporanHarian;
