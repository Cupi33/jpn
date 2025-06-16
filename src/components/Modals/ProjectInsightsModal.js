// src/components/Modals/ProjectionInsightsModal.js

import React from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ListGroup,
  ListGroupItem,
} from "reactstrap";

// Helper function to format state names nicely
const formatStateName = (name) => {
    if (!name || typeof name !== 'string') return 'N/A';
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const ProjectionInsightsModal = ({ isOpen, toggle, insights }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        Analisis Lanjut: Prospek Demografi Malaysia (10 Tahun)
      </ModalHeader>
      <ModalBody>
        {insights ? (
          <ListGroup flush>
            <ListGroupItem>
              <strong>1. Negeri yang bakal mempunyai purata umur paling tua:</strong>
              <p className="mb-0 mt-1 pl-3">
                {formatStateName(insights.oldest.name)} (Jangkaan: {insights.oldest.age.toFixed(1)} tahun)
              </p>
            </ListGroupItem>
            <ListGroupItem>
              <strong>2. Negeri yang bakal mempunyai purata umur paling muda:</strong>
              <p className="mb-0 mt-1 pl-3">
                {formatStateName(insights.youngest.name)} (Jangkaan: {insights.youngest.age.toFixed(1)} tahun)
              </p>
            </ListGroupItem>
            <ListGroupItem>
              <strong>3. Negeri yang paling meningkat (kependudukan):</strong>
              <p className="mb-0 mt-1 pl-3">
                {formatStateName(insights.topIncrease.name)} (Perubahan Tahunan: ~{insights.topIncrease.change.toFixed(0)} orang)
              </p>
            </ListGroupItem>
            <ListGroupItem>
              <strong>4. Negeri yang paling merosot (kependudukan):</strong>
              <p className="mb-0 mt-1 pl-3">
                {formatStateName(insights.topDecline.name)} (Perubahan Tahunan: ~{insights.topDecline.change.toFixed(0)} orang)
              </p>
            </ListGroupItem>
            <ListGroupItem>
              <strong>5. Pendapat masa hadapan negara:</strong>
              <p className="mb-0 mt-1 text-justify">
                {insights.outlookText}
              </p>
            </ListGroupItem>
          </ListGroup>
        ) : (
          <p>Memuatkan analisis...</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Tutup
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ProjectionInsightsModal;