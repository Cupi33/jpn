// src/components/Modals/KematianInsightsModal.js

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
    // Converts "PULAU_PINANG" or "PULAU PINANG" to "Pulau Pinang"
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\B\w+/g, l => l.toLowerCase());
};

const KematianInsightsModal = ({ isOpen, toggle, insights }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        Analisis Lanjut: Statistik Kematian Malaysia (5 Tahun)
      </ModalHeader>
      <ModalBody>
        {insights ? (
          <ListGroup flush>
            <ListGroupItem>
              <strong>1. Negeri yang mengalami paling banyak kematian dalam masa 5 tahun:</strong>
              <p className="mb-0 mt-1 pl-3">
                {formatStateName(insights.mostDeaths.name)} (Jumlah: {insights.mostDeaths.count.toLocaleString()} kematian)
              </p>
            </ListGroupItem>

            <ListGroupItem>
              <strong>2. Negeri yang mengalami paling sedikit kematian dalam masa 5 tahun:</strong>
              <p className="mb-0 mt-1 pl-3">
                {formatStateName(insights.fewestDeaths.name)} (Jumlah: {insights.fewestDeaths.count.toLocaleString()} kematian)
              </p>
            </ListGroupItem>

            <ListGroupItem>
              <strong>3. Jumlah kematian per tahun dalam masa 5 tahun:</strong>
              <ul className="pl-4 mt-1 mb-0" style={{ listStyleType: 'disc' }}>
                {insights.deathsPerYear.map(item => (
                  <li key={item.year}>
                    Tahun {item.year}: {item.count.toLocaleString()} kematian
                  </li>
                ))}
              </ul>
            </ListGroupItem>

            <ListGroupItem>
              <strong>4. Sebab utama permohonan pendaftaran kematian ditolak:</strong>
              <p className="mb-0 mt-1 pl-3">
                "{insights.topRejectionReason.reason}" (Sebanyak {insights.topRejectionReason.count} kes)
              </p>
            </ListGroupItem>
            
            <ListGroupItem>
              <strong>5. Analisis tentang isu kematian berdasarkan golongan umur:</strong>
              <p className="mb-0 mt-1 text-justify">
                {insights.ageGroupAnalysisText}
              </p>
            </ListGroupItem>

            <ListGroupItem>
              <strong>6. Analisis menyeluruh untuk statistik kematian di Malaysia dalam masa 5 tahun:</strong>
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

export default KematianInsightsModal;