import React from 'react';

/**
 * Reusable skeleton primitives for loading states.
 * Uses CSS shimmer animation (defined inline via style tag).
 *
 * Usage:
 *   <Skeleton.Line width="60%" />
 *   <Skeleton.Card />
 *   <Skeleton.ProfilePage />
 */

// --- Shimmer animation injected once ---
const shimmerCSS = `
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton-shimmer {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 800px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 6px;
}
`;

let styleInjected = false;
function injectStyles() {
  if (styleInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = shimmerCSS;
  document.head.appendChild(style);
  styleInjected = true;
}

// --- Primitives ---

interface LineProps {
  width?: string;
  height?: string;
  className?: string;
}

const Line: React.FC<LineProps> = ({ width = '100%', height = '16px', className = '' }) => {
  injectStyles();
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{ width, height, borderRadius: '6px' }}
    />
  );
};

const Circle: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => {
  injectStyles();
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{ width: size, height: size, borderRadius: '50%' }}
    />
  );
};

// --- Composed Skeletons ---

/** Skeleton for a single chamber card (used in directory & search results) */
const Card: React.FC = () => {
  injectStyles();
  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Circle size={44} />
        <div className="flex-1 space-y-2">
          <Line width="65%" height="14px" />
          <Line width="40%" height="12px" />
        </div>
      </div>
      <Line width="100%" height="12px" />
      <Line width="80%" height="12px" />
      <div className="flex gap-2 pt-1">
        <Line width="60px" height="24px" />
        <Line width="80px" height="24px" />
      </div>
    </div>
  );
};

/** Grid of skeleton cards (used on homepage & search page) */
const CardGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }, (_, i) => (
      <Card key={i} />
    ))}
  </div>
);

/** Full-page skeleton for ChamberProfile */
const ProfilePage: React.FC = () => {
  injectStyles();
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-6">
        <Circle size={80} />
        <div className="flex-1 space-y-3">
          <Line width="45%" height="24px" />
          <Line width="30%" height="14px" />
          <Line width="60%" height="12px" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Line width="100%" height="12px" />
        <Line width="90%" height="12px" />
        <Line width="70%" height="12px" />
      </div>

      {/* Products */}
      <div className="space-y-3">
        <Line width="30%" height="18px" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200/60 p-5 space-y-3">
              <Line width="50%" height="16px" />
              <Line width="100%" height="12px" />
              <Line width="80%" height="12px" />
              <Line width="120px" height="36px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** Admin dashboard skeleton */
const AdminPage: React.FC = () => {
  injectStyles();
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/60 p-5 space-y-2">
            <Line width="40%" height="12px" />
            <Line width="60%" height="28px" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-5 space-y-3">
        <Line width="30%" height="18px" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-4 py-2">
            <Circle size={32} />
            <Line width="25%" height="14px" />
            <Line width="20%" height="14px" />
            <Line width="80px" height="28px" />
          </div>
        ))}
      </div>
    </div>
  );
};

/** Auth form skeleton */
const AuthForm: React.FC = () => {
  injectStyles();
  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <Line width="50%" height="24px" className="mx-auto" />
        <Line width="70%" height="14px" className="mx-auto" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-1">
            <Line width="25%" height="12px" />
            <Line width="100%" height="40px" />
          </div>
        ))}
        <Line width="100%" height="44px" />
      </div>
    </div>
  );
};

// --- Namespace export ---

export const Skeleton = {
  Line,
  Circle,
  Card,
  CardGrid,
  ProfilePage,
  AdminPage,
  AuthForm,
};
