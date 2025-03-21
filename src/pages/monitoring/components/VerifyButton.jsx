import React, { useState } from 'react';
import Checkbox from '@mui/material/Checkbox';


const VerifyButton = ({ handleVerifyTask, id, checked, isDisabled }) => {
  const [check, setCheck] = useState(checked);
  const [taskDisabled, setTaskDisabled] = useState(isDisabled); // State to disable the checkbox temporarily

  const handleCheckboxChange = async() => {
    
    setCheck(!check); // Toggle the checkbox state
    const response = await handleVerifyTask(id); // Call the parent function
  
    // Delay the state update and handleVerifyTask by 2 seconds
    setTimeout(() => {
      setTaskDisabled(true);
      if (response !== "success") {
        setCheck(false);
        setTaskDisabled(false);
      }
    }, 2000);
  };

  return (
    <Checkbox
      title={isDisabled ? "task has been verified" : "check the box to verify task"}
      size='20'
      onClick={handleCheckboxChange}
      checked={check}
      color="primary"
      disabled={taskDisabled}
    />
  );
};

export default VerifyButton;
