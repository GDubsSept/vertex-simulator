import React, { useState, useEffect } from 'react';
import { AlertTriangle, Snowflake, CheckCircle } from 'lucide-react';

const CryoCountdown = ({ expiryTime, patientId, onExpire, status = 'active' }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [urgencyLevel, setUrgencyLevel] = useState('normal'); // normal, warning, critical, expired, saved

  useEffect(() => {
    if (!expiryTime || status === 'saved') {
      setUrgencyLevel('saved');
      return;
    }

    const calculateRemaining = () => {
      const now = new Date();
      const expiry = new Date(expiryTime);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        setUrgencyLevel('expired');
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });

      // Set urgency based on time remaining
      if (hours < 1) {
        setUrgencyLevel('critical');
      } else if (hours < 2) {
        setUrgencyLevel('warning');
      } else {
        setUrgencyLevel('normal');
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiryTime, status, onExpire]);

  if (!expiryTime && status !== 'saved') return null;

  const urgencyStyles = {
    normal: {
      bg: 'bg-vertex-500/20',
      border: 'border-vertex-500/50',
      text: 'text-vertex-400',
      glow: ''
    },
    warning: {
      bg: 'bg-warning-500/20',
      border: 'border-warning-500/50',
      text: 'text-warning-400',
      glow: 'shadow-lg shadow-warning-500/20'
    },
    critical: {
      bg: 'bg-critical-500/20',
      border: 'border-critical-500/50',
      text: 'text-critical-400',
      glow: 'shadow-lg shadow-critical-500/30 animate-pulse'
    },
    expired: {
      bg: 'bg-critical-900/50',
      border: 'border-critical-500',
      text: 'text-critical-400',
      glow: ''
    },
    saved: {
      bg: 'bg-success-500/20',
      border: 'border-success-500/50',
      text: 'text-success-400',
      glow: ''
    }
  };

  const style = urgencyStyles[urgencyLevel];

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className={`${style.bg} ${style.border} ${style.glow} border rounded-xl p-4 mb-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {urgencyLevel === 'saved' ? (
            <CheckCircle className={`w-5 h-5 ${style.text}`} />
          ) : urgencyLevel === 'expired' ? (
            <AlertTriangle className={`w-5 h-5 ${style.text}`} />
          ) : (
            <Snowflake className={`w-5 h-5 ${style.text} ${urgencyLevel === 'critical' ? 'animate-pulse' : ''}`} />
          )}
          <span className={`text-sm font-semibold ${style.text}`}>
            {urgencyLevel === 'saved' ? 'CELLS SECURED' : urgencyLevel === 'expired' ? 'CELLS EXPIRED' : 'CRYO EXPIRY COUNTDOWN'}
          </span>
        </div>
        {patientId && (
          <span className="text-xs text-neutral-500 font-mono">
            Patient: {patientId}
          </span>
        )}
      </div>

      {urgencyLevel === 'saved' ? (
        <div className="text-center py-2">
          <p className="text-success-400 font-semibold">Patient cells successfully transferred to cryo storage</p>
        </div>
      ) : urgencyLevel === 'expired' ? (
        <div className="text-center py-2">
          <p className="text-critical-400 font-semibold">CRITICAL: Cell viability compromised</p>
          <p className="text-critical-300 text-sm mt-1">Patient therapy cannot proceed</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2">
            <div className="text-center">
              <div className={`text-4xl font-mono font-bold ${style.text}`}>
                {formatNumber(timeRemaining?.hours || 0)}
              </div>
              <div className="text-xs text-neutral-500 uppercase">Hours</div>
            </div>
            <span className={`text-3xl font-bold ${style.text}`}>:</span>
            <div className="text-center">
              <div className={`text-4xl font-mono font-bold ${style.text}`}>
                {formatNumber(timeRemaining?.minutes || 0)}
              </div>
              <div className="text-xs text-neutral-500 uppercase">Min</div>
            </div>
            <span className={`text-3xl font-bold ${style.text}`}>:</span>
            <div className="text-center">
              <div className={`text-4xl font-mono font-bold ${style.text}`}>
                {formatNumber(timeRemaining?.seconds || 0)}
              </div>
              <div className="text-xs text-neutral-500 uppercase">Sec</div>
            </div>
          </div>

          {urgencyLevel === 'critical' && (
            <div className="mt-3 text-center">
              <p className="text-critical-400 text-sm font-medium animate-pulse">
                ⚠️ IMMEDIATE ACTION REQUIRED - Cell viability at risk
              </p>
            </div>
          )}

          <div className="mt-3 text-center">
            <p className="text-neutral-500 text-xs">
              Cells must maintain -150°C • Max out-of-cryo: 4 hours
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default CryoCountdown;