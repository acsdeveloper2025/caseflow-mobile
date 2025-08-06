import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, ListTodoIcon, ClockIcon, CheckCircle2Icon, StarIcon, UserIcon } from './Icons';

interface TabItem {
  name: string;
  route: string;
  icon: React.ComponentType<any>;
  label: string;
}

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: TabItem[] = [
    { name: 'Dashboard', route: '/', icon: HomeIcon, label: 'Home' },
    { name: 'Assigned', route: '/cases/assigned', icon: ListTodoIcon, label: 'Assigned' },
    { name: 'In Progress', route: '/cases/in-progress', icon: ClockIcon, label: 'In Progress' },
    { name: 'Completed', route: '/cases/completed', icon: CheckCircle2Icon, label: 'Completed' },
    { name: 'Saved', route: '/cases/saved', icon: StarIcon, label: 'Saved' },
    { name: 'Profile', route: '/profile', icon: UserIcon, label: 'Profile' },
  ];

  const isActive = (route: string) => {
    if (route === '/' && location.pathname === '/') return true;
    if (route !== '/' && location.pathname.startsWith(route)) return true;
    return false;
  };

  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderTop: '1px solid #374151',
      height: '60px',
      paddingBottom: '5px',
      paddingTop: '5px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    }}>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const active = isActive(tab.route);
        const color = active ? '#00a950' : '#9ca3af';
        
        return (
          <button
            key={tab.name}
            onClick={() => navigate(tab.route)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '4px',
              paddingBottom: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <IconComponent 
              color={color} 
              width={24} 
              height={24} 
              filled={tab.name === 'Saved' && active}
            />
            <span style={{
              color: color,
              fontSize: '10px',
              marginTop: '2px',
              fontWeight: active ? '600' : '400'
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
