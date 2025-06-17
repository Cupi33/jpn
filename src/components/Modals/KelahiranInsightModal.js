// src/components/Modals/KelahiranInsightsModal.js

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

// Helper function to format state names nicely (re-used from the other modal)
const formatStateName = (name) => {
    if (!name || typeof name !== 'string') return 'N/A';
    // Converts "PULAU_PINANG" or "PULAU PINANG" to "Pulau Pinang"
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\B\w+/g, l => l.toLowerCase());
};

const KelahiranInsightsModal = ({ isOpen, toggle, insights }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        Analisis Lanjut: Statistik Kelahiran Bayi di Malaysia (5 Tahun)
      </ModalHeader>
      <ModalBody>
        {insights ? (
          <ListGroup flush>
            <ListGroupItem>
              <strong>1. Negeri yang paling banyak kelahiran bayi dalam 5 tahun:</strong>
              <p className="mb-0 mt-1 pl-3">
                {formatStateName(insights.mostBirths.name)} (Jumlah: {insights.mostBirths.count.toLocaleString()} kelahiran)
              </p>
            </ListGroupItem>

            <ListGroupItem>
              <strong>2. Negeri yang paling sedikit kelahiran bayi dalam 5 tahun:</strong>
              <p className="mb-0 mt-1 pl-3">
                {formatStateName(insights.fewestBirths.name)} (Jumlah: {insights.fewestBirths.count.toLocaleString()} kelahiran)
              </p>
            </ListGroupItem>

            <ListGroupItem>
              <strong>3. Jumlah kelahiran per tahun dalam masa 5 tahun:</strong>
              <ul className="pl-4 mt-1 mb-0" style={{ listStyleType: 'disc' }}>
                {insights.birthsPerYear.map(item => (
                  <li key={item.year}>
                    Tahun {item.year}: {item.count.toLocaleString()} kelahiran
                  </li>
                ))}
              </ul>
            </ListGroupItem>

            <ListGroupItem>
              <strong>4. Sebab utama permohonan pendaftaran kelahiran bayi ditolak:</strong>
              <p className="mb-0 mt-1 pl-3">
                "{insights.topRejectionReason.reason}" (Sebanyak {insights.topRejectionReason.count} kes)
              </p>
            </ListGroupItem>
            
            <ListGroupItem>
              <strong>5. Analisis Status Kelahiran dalam masa 5 tahun:</strong>
              <p className="mb-0 mt-1 text-justify">
                {insights.birthStatusAnalysisText}
              </p>
            </ListGroupItem>

            <ListGroupItem>
              <strong>6. Analisis menyeluruh untuk statistik kelahiran bayi di Malaysia dalam masa 5 tahun:</strong>
              <p className="mb-0 mt-1 text-justify">
                {insights.overallAnalysisText}
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

export default KelahiranInsightsModal;