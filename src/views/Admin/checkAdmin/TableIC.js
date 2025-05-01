// reactstrap components
import {
    Card,
    Container,
    Row,
    Col,
    CardBody,
    CardHeader,
    Button,
  } from "reactstrap";

  import { Link } from "react-router-dom";
  
  const TableIC = () => {
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
                        <td style={tableCellStyle}>SAIFUZBAHARI BIN ISMAIL</td>
                      </tr>
                      <tr>
                        <td style={headerCellStyle}>Nombor Kad Pengenalan</td>
                        <td style={tableCellStyle}>770708086761</td>
                      </tr>
                      <tr>
                        <td style={headerCellStyle}>Sebab Permohonan</td>
                        <td style={tableCellStyle}>Hilang Kad </td>
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
                    <Link to = "/adminApplication/checkIC">
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