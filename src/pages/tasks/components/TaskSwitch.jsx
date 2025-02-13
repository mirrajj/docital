import { useState } from 'react';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

const StyledSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase': {
    //   color: theme.palette.primary.main,

    '&.Mui-checked': {
      color: "#fff",
    },
    '&.Mui-checked + .MuiSwitch-track': {
      backgroundColor: "green",
    },
  },
}));

const TaskSwitch = ({ checked, updateTaskStatus, itemID,setShowSucess,setShowError }) => {
  const [ischecked, setIsChecked] = useState(checked);

  const onChange = (e) => {
    setIsChecked(!ischecked);
    updateTaskStatus(itemID, !ischecked,setShowSucess,setShowError);
  };


  return (
    <StyledSwitch color="primary" onChange={(e) => onChange(e)} size="small" checked={ischecked} />
  );
}

export default TaskSwitch;
