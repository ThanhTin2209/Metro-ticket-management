import React from 'react';

const Skeleton = ({ className, circle = false }) => {
  return (
    <div className={`bg-slate-200 animate-pulse ${circle ? 'rounded-full' : 'rounded-2xl'} ${className}`}></div>
  );
};

export default Skeleton;
