import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Table,
} from "reactstrap";
import Header from "components/Headers/Header.js";
import InboxModal from "./InboxModal"; // You’ll create this

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [inReview, setInReview] = useState([]);
  const [reviewed, setReviewed] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const citizenID = sessionStorage.getItem("citizenID");
    const username = sessionStorage.getItem("username");

    if (citizenID && username) {
      setIsLoading(false);

      // Simulated fetch
      setInReview([
        { id: 1, type: "Kematian", dateSent: "2024-06-01" },
        { id: 2, type: "Kelahiran", dateSent: "2024-06-02" },
      ]);
      setReviewed([
        { id: 3, type: "Kematian", dateSent: "2024-05-20", reviewDate: "2024-06-01" },
      ]);
    } else {
      navigate("/authCitizen/login");
    }
  }, [navigate]);

  const openModal = (data) => {
    setModalData(data);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <Container className="mt-5 text-center">
        <h4>Memuatkan...</h4>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <Col xl="12">
            <Card className="shadow mb-4">
              <CardHeader><h3>Dalam Semakan</h3></CardHeader>
              <CardBody>
                <Table responsive className="align-items-center table-flush">
                  <thead className="thead-light">
                    <tr>
                      <th>Jenis Permohonan</th>
                      <th>Tarikh Dihantar</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {inReview.map((app) => (
                      <tr key={app.id}>
                        <td>{app.type}</td>
                        <td>{app.dateSent}</td>
                        <td>
                          <Button size="sm" color="info" onClick={() => openModal(app)}>
                            Lihat Butiran
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>

            <Card className="shadow">
              <CardHeader><h3>Siap Disemak</h3></CardHeader>
              <CardBody>
                <Table responsive className="align-items-center table-flush">
                  <thead className="thead-light">
                    <tr>
                      <th>Jenis Permohonan</th>
                      <th>Tarikh Dihantar</th>
                      <th>Tarikh Semakan</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewed.map((app) => (
                      <tr key={app.id}>
                        <td>{app.type}</td>
                        <td>{app.dateSent}</td>
                        <td>{app.reviewDate}</td>
                        <td>
                          <Button size="sm" color="info" onClick={() => openModal(app)}>
                            Lihat Butiran
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Detail Modal */}
      {modalOpen && (
        <InboxModal
          data={modalData}
          isOpen={modalOpen}
          toggle={() => setModalOpen(false)}
        />
      )}
    </>
  );
};

export default Index;
