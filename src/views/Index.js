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
import InboxModal from "./InboxModal";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [pendingApps, setPendingApps] = useState([]);
  const [reviewedApps, setReviewedApps] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const citizenID = sessionStorage.getItem("citizenID");
    const username = sessionStorage.getItem("username");

    console.log('citizenID : ', citizenID);
    console.log('username : ', username);

    if (citizenID && username) {
      fetchPendingApplications(citizenID);
      fetchReviewedApplications(citizenID);
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
      console.error("Error fetching pending apps:", error);
      setPendingApps([]);
    }
  };

  const fetchReviewedApplications = async (citizenID) => {
    try {
      const response = await axios.post("http://localhost:5000/inbox/listReview", {
        citizenID,
      });

      if (response.data.success) {
        setReviewedApps(response.data.users);
      } else {
        setReviewedApps([]);
      }
    } catch (error) {
      console.error("Error fetching reviewed apps:", error);
      setReviewedApps([]);
    } finally {
      setIsLoading(false);
    }
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
                {isLoading ? (
                  <p>Memuatkan...</p>
                ) : reviewedApps.length === 0 ? (
                  <p>Tiada permohonan yang telah disemak.</p>
                ) : (
                  <Table responsive className="align-items-center table-flush">
                    <thead className="thead-light">
                      <tr>
                        <th>Jenis Permohonan</th>
                        <th>Tarikh Dihantar</th>
                        <th>Tarikh Disemak</th>
                        <th>Keputusan</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewedApps.map((app) => (
                        <tr key={app.appID}>
                          <td>{app.appType}</td>
                          <td>{new Date(app.appDate).toLocaleDateString("ms-MY")}</td>
                          <td>{new Date(app.reviewDate).toLocaleDateString("ms-MY")}</td>
                          <td>{app.decision}</td>
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
