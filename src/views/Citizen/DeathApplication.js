import React from 'react';
import { Card, CardBody, CardTitle, Container, Row, Col } from 'reactstrap';

const DeathApplication = () => {
    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md="8">
                    <Card className="shadow">
                        <CardBody>
                            <CardTitle tag="h3" className="mb-4 text-center">
                                Pendaftaran Kematian
                            </CardTitle>
                            <p className="text-center">
                                Ini adalah halaman untuk mendaftarkan kematian.
                            </p>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DeathApplication;
