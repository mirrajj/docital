import React from 'react';
import Switch from '@mui/material/Switch';
import {styled} from '@mui/material/styles';

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

const TaskSwitch = ({onChange}) => { //onChange function to be passed as prop

  return (
    <StyledSwitch color="primary" onChange={onChange} size="small" />
  );
}

export default TaskSwitch;
