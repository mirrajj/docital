import React from 'react';
import Checkbox from '@mui/material/Checkbox';


const VerifyButton = ({handleVerificationStatus,id,checked}) => {
  return (
    <Checkbox
        checked = {checked}
        color='success'
        onChange={() => handleVerificationStatus(id)}
    />
  );
}

export default VerifyButton;
