import React,{useState} from 'react';
import MonitoringList from './components/MonitoringList';
import MonitoringHeader from './components/MonitoringHeader';
import AppAlert from '../../common/AppAlert';

const Monitoring = () => {
  const [showSuccess, setShowSuccess] = useState({ state: false, message: "" });
  const [showError, setShowError] = useState({ state: false, message: "" });

  return (
    <div>
      {showError.state && (
        <AppAlert
          type="error"
          message={showError.message}
          onClose={() => setShowError(false)}
        />
      )}

      {showSuccess.state && (
        <AppAlert
          type="success"
          message={showSuccess.message}
          onClose={() => setShowSuccess(false)}
        />
      )}
        <MonitoringList setShowError={setShowError} setShowSuccess={setShowSuccess} />
    </div>
  );
}

export default Monitoring;
