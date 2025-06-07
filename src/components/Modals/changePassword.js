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
  Spinner,
  Form
} from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const ChangePasswordModal = ({ isOpen, toggle, username }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle the password update process
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      Swal.fire('Ralat', 'Sila isi semua ruangan.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire('Ralat', 'Kata laluan baharu tidak sepadan.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      Swal.fire('Ralat', 'Kata laluan baharu mestilah sekurang-kurangnya 6 aksara.', 'error');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/changePassword', {
        oldpassword: oldPassword,
        newpassword: newPassword,
        username: username,
      });

      if (response.data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Berjaya!',
          text: 'Kata laluan berjaya diubah.',
          timer: 2000,
          showConfirmButton: false,
        });
        handleToggle(); // Close the modal and reset fields
      } else {
        // Handle specific API error message (e.g., "Salah kata laluan")
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: response.data.message || 'Gagal mengubah kata laluan.',
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
      console.error('Error changing password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal and reset all state
  const handleToggle = () => {
    if (!isLoading) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toggle();
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={handleToggle} centered>
      <ModalHeader toggle={handleToggle}>Ubah Kata Laluan</ModalHeader>
      <Form onSubmit={handleUpdatePassword}>
        <ModalBody>
          <FormGroup>
            <Label for="oldPassword">Kata Laluan Lama</Label>
            <Input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Masukkan kata laluan lama"
              required
              disabled={isLoading}
            />
          </FormGroup>
          <FormGroup>
            <Label for="newPassword">Kata Laluan Baharu</Label>
            <Input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan kata laluan baharu"
              required
              minLength="6"
              disabled={isLoading}
            />
          </FormGroup>
          <FormGroup>
            <Label for="confirmPassword">Sahkan Kata Laluan Baharu</Label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Sahkan kata laluan baharu"
              required
              minLength="6"
              disabled={isLoading}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleToggle} disabled={isLoading}>
            Batal
          </Button>
          <Button color="primary" type="submit" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : 'Simpan Perubahan'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;