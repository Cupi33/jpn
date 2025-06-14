// reactstrap components
import { Row, Col } from "reactstrap";

const Footer = () => {
  return (
    <footer className="footer">
      <Row className="align-items-center justify-content-center">
        <Col xl="12">
          <div className="copyright text-center text-muted">
            <a
              className="font-weight-bold ml-1"
              href="https://www.jpn.gov.my/my/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Laman Web Rasmi JPN
            </a>
          </div>
        </Col>
      </Row>
    </footer>
  );
};

export default Footer;
