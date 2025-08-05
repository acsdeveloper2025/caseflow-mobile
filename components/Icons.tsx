import React from 'react';
import { Svg, Path, Polyline, Rect, Circle, Polygon, Line } from 'react-native-svg';

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

const iconSize = { width: 24, height: 24 };

export const HomeIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
  <Svg width={width || iconSize.width} height={height || iconSize.height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></Path><Polyline points="9 22 9 12 15 12 15 22"></Polyline>
  </Svg>
);

export const ListTodoIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
  <Svg width={width || iconSize.width} height={height || iconSize.height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="5" width="6" height="6" rx="1"></Rect><Path d="m3 17 2 2 4-4"></Path><Path d="M13 6h8"></Path><Path d="M13 12h8"></Path><Path d="M13 18h8"></Path>
  </Svg>
);

export const ClockIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
  <Svg width={width || iconSize.width} height={height || iconSize.height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10"></Circle><Polyline points="12 6 12 12 16 14"></Polyline>
  </Svg>
);

export const CheckCircle2Icon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
  <Svg width={width || iconSize.width} height={height || iconSize.height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></Path><Path d="m9 12 2 2 4-4"></Path>
  </Svg>
);

export const StarIcon: React.FC<IconProps & { filled?: boolean }> = ({ width, height, color = "currentColor", filled }) => (
  <Svg width={width || iconSize.width} height={height || iconSize.height} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></Polygon>
  </Svg>
);

export const LogOutIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
  <Svg width={width || 20} height={height || 20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></Path><Polyline points="16 17 21 12 16 7"></Polyline><Line x1="21" y1="12" x2="9" y2="12"></Line>
  </Svg>
);

export const RefreshCwIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
  <Svg width={width || 20} height={height || 20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></Path><Path d="M21 3v5h-5"></Path><Path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></Path><Path d="M3 21v-5h5"></Path>
  </Svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
    <Svg width={width || 16} height={height || 16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="m12 3-1.9 3.8-3.8 1.9 3.8 1.9L12 14.4l1.9-3.8 3.8-1.9-3.8-1.9L12 3z"/><Path d="M5 9l-1 2-2 1 2 1 1 2 1-2 2-1-2-1-1-2z"/><Path d="M19 15l-1 2-2 1 2 1 1 2 1-2 2-1-2-1-1-2z"/>
    </Svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
    <Svg width={width || 16} height={height || 16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="6 9 12 15 18 9"></Polyline>
    </Svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
    <Svg width={width || 16} height={height || 16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="18 15 12 9 6 15"></Polyline>
    </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
    <Svg width={width || iconSize.width} height={height || iconSize.height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="20 6 9 17 4 12"></Polyline>
    </Svg>
);

export const XIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
    <Svg width={width || iconSize.width} height={height || iconSize.height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Line x1="18" y1="6" x2="6" y2="18"></Line><Line x1="6" y1="6" x2="18" y2="18"></Line>
    </Svg>
);

export const InfoIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
    <Svg width={width || iconSize.width} height={height || iconSize.height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="10"></Circle><Line x1="12" y1="16" x2="12" y2="12"></Line><Line x1="12" y1="8" x2="12.01" y2="8"></Line>
    </Svg>
);

export const ArrowUpIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
    <Svg width={width || iconSize.width} height={height || iconSize.height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Line x1="12" y1="19" x2="12" y2="5"></Line><Polyline points="5 12 12 5 19 12"></Polyline>
    </Svg>
);

export const ArrowDownIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
    <Svg width={width || iconSize.width} height={height || iconSize.height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Line x1="12" y1="5" x2="12" y2="19"></Line><Polyline points="19 12 12 19 5 12"></Polyline>
    </Svg>
);

export const CameraIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
    <Svg width={width || iconSize.width} height={height || iconSize.height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></Path>
        <Circle cx="12" cy="13" r="3"></Circle>
    </Svg>
);

export const MapPinIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
    <Svg width={width || iconSize.width} height={height || iconSize.height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></Path>
        <Circle cx="12" cy="10" r="3"></Circle>
    </Svg>
);

export const UserIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
  <Svg width={width || iconSize.width} height={height || iconSize.height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></Path><Circle cx="12" cy="7" r="4"></Circle>
  </Svg>
);

export const IdCardIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
  <Svg width={width || 20} height={height || 20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect width="20" height="16" x="2" y="4" rx="2"></Rect><Path d="M6 10h2"></Path><Path d="M14 10h4"></Path><Path d="M6 14h12"></Path>
  </Svg>
);

export const ClipboardIcon: React.FC<IconProps> = ({ width, height, color = "currentColor" }) => (
    <Svg width={width || 20} height={height || 20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Rect width="8" height="4" x="8" y="2" rx="1" ry="1"></Rect>
        <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></Path>
    </Svg>
);
