import React, { ReactNode, useState } from 'react';
import { Home, Zap, AlertCircle, Settings, Wifi, WifiOff } from 'lucide-react';
import { useMobileFieldWorker } from '@/hooks/useMobileFieldWorker';

interface MobileFieldWorkerLayoutProps {
  children: ReactNode;
  onTabChange?: (tab: string) => void;
}

export const MobileFieldWorkerLayout: React.FC<MobileFieldWorkerLayoutProps> = ({
  children,
  onTabChange,
}) => {
  const { isOnline, isMobile, isFieldWorkerMode } = useMobileFieldWorker();
  const [activeTab, setActiveTab] = useState('home');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header with offline indicator */}
      <div className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">FarmKonnect</h1>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <div className="flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </div>
          )}
          {isOnline && (
            <div className="flex items-center gap-1 text-xs text-green-600 px-2 py-1">
              <Wifi className="w-3 h-3" />
              <span>Online</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {children}
        </div>
      </div>

      {/* Bottom tab navigation - optimized for touch */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around z-50">
        <TabButton
          icon={<Home className="w-6 h-6" />}
          label="Home"
          active={activeTab === 'home'}
          onClick={() => handleTabChange('home')}
        />
        <TabButton
          icon={<Zap className="w-6 h-6" />}
          label="Quick"
          active={activeTab === 'quick'}
          onClick={() => handleTabChange('quick')}
        />
        <TabButton
          icon={<AlertCircle className="w-6 h-6" />}
          label="Alerts"
          active={activeTab === 'alerts'}
          onClick={() => handleTabChange('alerts')}
        />
        <TabButton
          icon={<Settings className="w-6 h-6" />}
          label="Settings"
          active={activeTab === 'settings'}
          onClick={() => handleTabChange('settings')}
        />
      </div>
    </div>
  );
};

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-3 px-2 min-h-[60px] transition-colors ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

/**
 * Quick action button component for field workers
 * Optimized for touch with 44px minimum height
 */
export const QuickActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}> = ({ icon, label, onClick, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-3 px-4 py-4 rounded-lg font-medium text-base transition-colors ${variantClasses[variant]}`}
    >
      <div className="text-2xl">{icon}</div>
      <span>{label}</span>
    </button>
  );
};

/**
 * Mobile-optimized form input component
 */
export const MobileFormInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
}> = ({ label, value, onChange, placeholder, type = 'text', required, error }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 text-base border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? 'border-destructive' : 'border-border'
        }`}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
};

/**
 * Mobile-optimized data display card
 */
export const MobileDataCard: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  status?: 'normal' | 'warning' | 'critical';
}> = ({ title, value, unit, icon, status = 'normal' }) => {
  const statusClasses = {
    normal: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    critical: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${statusClasses[status]} mb-3`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">
            {value}
            {unit && <span className="text-sm ml-1">{unit}</span>}
          </p>
        </div>
        {icon && <div className="text-2xl opacity-50">{icon}</div>}
      </div>
    </div>
  );
};
