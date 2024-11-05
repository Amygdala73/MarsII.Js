import React from 'react';
import { render, screen } from '@testing-library/react';
import Rotation, { parseRotation } from './Rotation';

describe('parseRotation', () => {
  it('should correctly parse rotation data', () => {
    const message = "MessageXYZL[0,0,0]R[10.5,-20.3,30.7]A[0,0,0]G[0,0,0]T[000:00-00T00:00:00]";
    const result = parseRotation(message);
    expect(result).toEqual({ yaw: 10.5, pitch: -20.3, roll: 30.7 });
  });

  it('should return null for invalid input', () => {
    const message = "Invalid message format";
    const result = parseRotation(message);
    expect(result).toBeNull();
  });
});

describe('Rotation component', () => {
  it('renders rotation data', () => {
    const message = "MessageXYZL[0,0,0]R[10.5,-20.3,30.7]A[0,0,0]G[0,0,0]T[000:00-00T00:00:00]";
    render(<Rotation message={message} />);
    expect(screen.getByText(/Yaw: 10.50°/)).toBeInTheDocument();
    expect(screen.getByText(/Pitch: -20.30°/)).toBeInTheDocument();
    expect(screen.getByText(/Roll: 30.70°/)).toBeInTheDocument();
  });
});