
import { describe, it, expect } from 'vitest';

import {
  STATUS,
  createInitialState,
  transition,
} from './telemetry-state-machine.js';

describe('PUBG Telemetry State Machine', () => {
  it('should initialize in IDLE state', () => {
    expect(createInitialState()).toEqual({
      status: STATUS.IDLE,
    });
  });

  it('should allow IDLE -> LOADING', () => {
    const next = transition(createInitialState(), {
      status: STATUS.LOADING,
    });

    expect(next.status).toBe(STATUS.LOADING);
  });

  it('should allow LOADING -> SUCCESS', () => {
    const loading = { status: STATUS.LOADING };
    const data = { id: 'ces', kills: 14 };

    const next = transition(loading, {
      status: STATUS.SUCCESS,
      data,
    });

    expect(next.data).toEqual(data);
  });

  it('should allow LOADING -> ERROR', () => {
    const next = transition(
      { status: STATUS.LOADING },
      {
        status: STATUS.ERROR,
        error: 'Packet timeout',
      },
    );

    expect(next.status).toBe(STATUS.ERROR);
  });

  it('should allow ERROR -> LOADING for retry', () => {
    const next = transition(
      { status: STATUS.ERROR, error: 'Packet timeout' },
      { status: STATUS.LOADING },
    );

    expect(next.status).toBe(STATUS.LOADING);
  });

  it('should reject IDLE -> SUCCESS', () => {
    expect(() =>
      transition(createInitialState(), {
        status: STATUS.SUCCESS,
        data: { id: 'ces' },
      }),
    ).toThrow();
  });
});
