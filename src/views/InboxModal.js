import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "reactstrap";

const InboxModal = ({ isOpen, toggle, data }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Butiran Permohonan</ModalHeader>
      <ModalBody>
        <p><strong>Jenis Permohonan:</strong> {data.type}</p>
        <p><strong>Tarikh Dihantar:</strong> {data.dateSent}</p>
        {data.reviewDate && (
          <p><strong>Tarikh Disemak:</strong> {data.reviewDate}</p>
        )}
        {/* Add more detail fields as needed */}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Tutup</Button>
      </ModalFooter>
    </Modal>
  );
};

export default InboxModal;
