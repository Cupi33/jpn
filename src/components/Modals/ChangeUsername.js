import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Spinner
} from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const ChangeUsernameModal = ({ isOpen, toggle, citizenID, currentUsername, onUsernameUpdate }) => {
  const [newUsername, setNewUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle the username update process
  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      Swal.fire('Ralat', 'Sila masukkan nama pengguna baharu.', 'error');
      return;
    }
    if (newUsername.trim() === currentUsername) {
        Swal.fire('Makluman', 'Nama pengguna baharu sama dengan nama pengguna semasa.', 'info');
        return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/changeUsername', {
        username: newUsername,
        citizenID: citizenID,
      });

      if (response.data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Berjaya!',
          text: 'Nama pengguna berjaya diubah.',
          timer: 2000,
          showConfirmButton: false,
        });
        onUsernameUpdate(newUsername); // Call the parent update function
        toggle(); // Close the modal
        setNewUsername(''); // Reset the input field
      } else {
        // Handle specific API error message (e.g., "Username sudah diguna")
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: response.data.message || 'Gagal mengubah nama pengguna.',
        });
      }
    } catch (error) {
      // Handle network/server errors from axios
      const errorMessage = error.response?.data?.message || 'Isu server. Sila cuba sebentar lagi.';
      Swal.fire({
        icon: 'error',
        title: 'Ralat',
        text: errorMessage,
      });
      console.error('Error changing username:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal and reset state
  const handleToggle = () => {
    if (!isLoading) {
      setNewUsername('');
      toggle();
    }
  }

  return (
    <Modal isOpen={isOpen} toggle={handleToggle} centered>
      <ModalHeader toggle={handleToggle}>Ubah Nama Pengguna</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="newUsername">Nama Pengguna Baharu</Label>
          <Input
            type="text"
            name="newUsername"
            id="newUsername"
            placeholder="Masukkan nama pengguna baharu"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            disabled={isLoading}
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleToggle} disabled={isLoading}>
          Batal
        </Button>
        <Button color="primary" onClick={handleUpdateUsername} disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : 'Simpan Perubahan'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ChangeUsernameModal;