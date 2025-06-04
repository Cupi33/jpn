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
import axios from "axios";
import Header from "components/Headers/Header.js";
import InboxModal from "./InboxModal"; // Create this file

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [pendingApps, setPendingApps] = useState([]);
  const [reviewedApps, setReviewedApps] = useState([]); // Dummy for now
  const [modalData, setModalData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const citizenID = sessionStorage.getItem("citizenID");
    const username = sessionStorage.getItem("username");

    if (citizenID && username) {
      fetchPendingApplications(citizenID);
      loadReviewedApps(); // use dummy
    } else {
      navigate("/authCitizen/login");
    }
  }, [navigate]);

  const fetchPendingApplications = async (citizenID) => {
    try {
      const response = await axios.post("http://localhost:5000/inbox/listPending", {
        citizenID,
      });

      if (response.data.success) {
        setPendingApps(response.data.users);
      } else {
        setPendingApps([]);
      }
    } catch (error) {
      console.error("Error fetching inbox:", error);
      setPendingApps([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviewedApps = () => {
    setReviewedApps([
      {
        appID: 101,
        appType: "Kelahiran",
        appDate: "2024-04-10",
        reviewDate: "2024-04-15",
      },
      {
        appID: 102,
        appType: "Kematian",
        appDate: "2024-03-05",
        reviewDate: "2024-03-12",
      },
    ]);
  };

  const openModal = (data) => {
    setModalData(data);
    setModalOpen(true);
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <Col xl="12">
            {/* Dalam Semakan */}
            <Card className="shadow mb-4">
              <CardHeader>
                <h3>Dalam Semakan</h3>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <p>Memuatkan...</p>
                ) : pendingApps.length === 0 ? (
                  <p>Tiada permohonan dalam semakan.</p>
                ) : (
                  <Table responsive className="align-items-center table-flush">
                    <thead className="thead-light">
                      <tr>
                        <th>Jenis Permohonan</th>
                        <th>Tarikh Dihantar</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApps.map((app) => (
                        <tr key={app.appID}>
                          <td>{app.appType}</td>
                          <td>{new Date(app.appDate).toLocaleDateString("ms-MY")}</td>
                          <td>
                            <Button size="sm" color="info" onClick={() => openModal(app)}>
                              Lihat Butiran
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>

            {/* Siap Disemak */}
            <Card className="shadow">
              <CardHeader>
                <h3>Siap Disemak</h3>
              </CardHeader>
              <CardBody>
                {reviewedApps.length === 0 ? (
                  <p>Tiada permohonan yang telah disemak.</p>
                ) : (
                  <Table responsive className="align-items-center table-flush">
                    <thead className="thead-light">
                      <tr>
                        <th>Jenis Permohonan</th>
                        <th>Tarikh Dihantar</th>
                        <th>Tarikh Disemak</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewedApps.map((app) => (
                        <tr key={app.appID}>
                          <td>{app.appType}</td>
                          <td>{new Date(app.appDate).toLocaleDateString("ms-MY")}</td>
                          <td>{new Date(app.reviewDate).toLocaleDateString("ms-MY")}</td>
                          <td>
                            <Button size="sm" color="info" onClick={() => openModal(app)}>
                              Lihat Butiran
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal */}
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
