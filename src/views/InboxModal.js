import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";

import DeathDetails from "./ApplicationDetail/DeathDetail";
import ICDetails from "./ApplicationDetail/ICDetail";
import NewbornDetails from "./ApplicationDetail/NewbornDetail";

const InboxModal = ({ isOpen, toggle, data }) => {
  if (!data) {
    return (
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Error</ModalHeader>
        <ModalBody>Data not available</ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }

  const { appID, appType, statusSection } = data;

  const renderDetails = () => {
    if (!appID || !appType) {
      return <p>Application data is incomplete.</p>;
    }

    // Exact matching with the actual appType values
    switch(appType) {
      case "PERMOHONAN PENDAFTARAN KEMATIAN":
        return <DeathDetails appID={appID} statusSection={statusSection} />;
      case "PERMOHONAN KAD PENGENALAN":
        return <ICDetails appID={appID} statusSection={statusSection} />;
      case "PERMOHONAN PENDAFTARAN BAYI":
        return <NewbornDetails appID={appID} statusSection={statusSection} />;
      default:
        console.log("Unmatched appType:", appType);
        return <p>Butiran tidak tersedia untuk jenis permohonan ini: {appType}</p>;
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Butiran Permohonan</ModalHeader>
      <ModalBody>{renderDetails()}</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Tutup</Button>
      </ModalFooter>
    </Modal>
  );
};

export default InboxModal;