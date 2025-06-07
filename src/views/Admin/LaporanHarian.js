import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  Table,
  Container,
  Row,
  Col,
} from "reactstrap";
import AdminHeader from "components/Headers/AdminHeader";
import { useNavigate } from "react-router-dom";

const LaporanHarian = (props) => {
  const [dailyStats, setDailyStats] = useState({
    newborn: { total_applied_today: 0, total_reviewed: 0, total_accepted: 0, total_rejected: 0 },
    death: { total_applied_today: 0, total_reviewed: 0, total_accepted: 0, total_rejected: 0 },
    ic: { total_applied_today: 0, total_reviewed: 0, total_accepted: 0, total_rejected: 0 },
  });

  const [historyStats, setHistoryStats] = useState({
    newborn: { totalReviewed: 0, accepted: 0, rejected: 0 },
    death: { totalReviewed: 0, accepted: 0, rejected: 0 },
    ic: { totalReviewed: 0, accepted: 0, rejected: 0 },
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedStaffID = sessionStorage.getItem('staffID');
    const storedUsername = sessionStorage.getItem('username');

    if (!storedStaffID || !storedUsername) {
      navigate('/authCitizen/login');
    }
  }, [navigate]);

  useEffect(() => {
    const currentStaffID = sessionStorage.getItem('staffID');
    if (!currentStaffID) {
      console.log("No staff ID found, skipping data fetch.");
      return; 
    }

    const fetchDailyData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/adminstat/staffDailyReview?staffId=${currentStaffID}`);
        const data = await response.json();

        if (data.success) {
          // --- FIX IS HERE ---
          // Create a new object from scratch instead of spreading state.
          const processedStats = {
            newborn: { total_applied_today: 0, total_reviewed: 0, total_accepted: 0, total_rejected: 0 },
            death: { total_applied_today: 0, total_reviewed: 0, total_accepted: 0, total_rejected: 0 },
            ic: { total_applied_today: 0, total_reviewed: 0, total_accepted: 0, total_rejected: 0 },
          };

          data.stat.forEach(item => {
            let key;
            if (item.APPTYPE === 'NEWBORN') key = 'newborn';
            else if (item.APPTYPE === 'DEATH') key = 'death';
            else if (item.APPTYPE === 'IC') key = 'ic';

            if (key) {
              processedStats[key] = {
                total_applied_today: item.TOTAL_APPLIED_TODAY,
                total_reviewed: item.TOTAL_REVIEWED,
                total_accepted: item.TOTAL_ACCEPTED,
                total_rejected: item.TOTAL_REJECTED
              };
            }
          });
          setDailyStats(processedStats);
        } else {
          console.error("API Error (Daily):", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch daily data:", error);
      }
    };

    const fetchHistoryData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/adminstat/staffHistoryReview?staffId=${currentStaffID}`);
        const data = await response.json();
        if (data.success) {
          // --- FIX IS HERE ---
          // Create a new object from scratch instead of spreading state.
          const aggregatedStats = {
            newborn: { totalReviewed: 0, accepted: 0, rejected: 0 },
            death: { totalReviewed: 0, accepted: 0, rejected: 0 },
            ic: { totalReviewed: 0, accepted: 0, rejected: 0 },
          };

          data.stat.forEach(item => {
            let key;
            if (item.APPTYPE === 'NEWBORN') key = 'newborn';
            else if (item.APPTYPE === 'DEATH') key = 'death';
            else if (item.APPTYPE === 'IC') key = 'ic';
            if (key) {
              if (item.DECISION === 'ACCEPT') aggregatedStats[key].accepted += item.TOTAL;
              else if (item.DECISION === 'REJECT') aggregatedStats[key].rejected += item.TOTAL;
              aggregatedStats[key].totalReviewed += item.TOTAL;
            }
          });
          setHistoryStats(aggregatedStats);
        } else {
          console.error("API Error (History):", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch history data:", error);
      }
    };

    fetchDailyData();
    fetchHistoryData();
  }, []); // The empty array is now correct and will not show a warning.

  return (
    <>
      <AdminHeader />
      {/* ... The rest of your JSX remains the same ... */}
      <Container className="mt--7" fluid>
        <Row className="mt-5">
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
                    <td>{dailyStats.newborn.total_applied_today}</td>
                    <td>{dailyStats.newborn.total_reviewed}</td>
                    <td>{dailyStats.newborn.total_accepted}</td>
                    <td>{dailyStats.newborn.total_rejected}</td>
                  </tr>
                  <tr>
                    <th scope="row">Kematian</th>
                    <td>{dailyStats.death.total_applied_today}</td>
                    <td>{dailyStats.death.total_reviewed}</td>
                    <td>{dailyStats.death.total_accepted}</td>
                    <td>{dailyStats.death.total_rejected}</td>
                  </tr>
                  <tr>
                    <th scope="row">Kad Pengenalan</th>
                    <td>{dailyStats.ic.total_applied_today}</td>
                    <td>{dailyStats.ic.total_reviewed}</td>
                    <td>{dailyStats.ic.total_accepted}</td>
                    <td>{dailyStats.ic.total_rejected}</td>
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
                    <td>{historyStats.newborn.totalReviewed}</td>
                    <td>{historyStats.newborn.accepted}</td>
                    <td>{historyStats.newborn.rejected}</td>
                  </tr>
                  <tr>
                    <th scope="row">Kematian</th>
                    <td>{historyStats.death.totalReviewed}</td>
                    <td>{historyStats.death.accepted}</td>
                    <td>{historyStats.death.rejected}</td>
                  </tr>
                  <tr>
                    <th scope="row">Kad Pengenalan</th>
                    <td>{historyStats.ic.totalReviewed}</td>
                    <td>{historyStats.ic.accepted}</td>
                    <td>{historyStats.ic.rejected}</td>
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