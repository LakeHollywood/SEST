import type { SurfaceArea } from '../types';

export const surfaceAreas: SurfaceArea[] = [
  {
    id: 'dma',
    title: 'DMA & Snapshot Isolation',
    icon: 'cpu',
    color: 'red',
    description: 'Direct Memory Access attacks defeated by immediate payload snapshot isolation',
    tests: [
      {
        id: 'STS-DMA-001',
        name: 'Payload Mutation Defense',
        description:
          'Simulates a DMA attack where an adversary modifies the observation payload in memory after the signature check but before authority is finalized. The hardened engine clones all fields immediately upon entry.',
        status: 'passing',
        duration: 14,
        assertions: 1,
        details: {
          attackVector: 'DMA payload mutation via shared memory during evaluation',
          mitigation: 'Immediate snapshot of payload, signature, multi-sig, and metadata on function entry',
          riskLevel: 'critical',
          defenseLayer: 'Defense Layer 1: Snapshot Isolation',
          parameters: {
            'payload_bytes': 'Vec<u8> (cloned)',
            'signature_bytes': 'Vec<u8> (cloned)',
            'multi_sig_payload': 'Option<Vec<u8>> (cloned)',
            'metadata': 'ObservationMetadata (cloned)',
          },
        },
      },
    ],
  },
  {
    id: 'physical',
    title: 'Physical Oscillator & Drift',
    icon: 'waves',
    color: 'purple',
    description: 'Side-channel attacks via clock glitching, environmental breaches, and excessive drift',
    tests: [
      {
        id: 'STS-PHY-001',
        name: 'Oscillator Glitch Detection',
        description:
          'Simulates clock glitching / frequency injection. The engine must detect jitter or drift outside the Validity Envelope (V) even if the digital signature is valid.',
        status: 'passing',
        duration: 8,
        assertions: 1,
        details: {
          attackVector: 'High-frequency noise injection into oscillator input',
          mitigation: 'Physical precision validation against registered source profile; envelope rejection on "GLITCHED" keyword',
          riskLevel: 'critical',
          defenseLayer: 'Envelope Inspection (V)',
          parameters: {
            'physical_precision_ps': '0.001 (anomalous)',
            'fractional_uncertainty': '1e-18',
            'signal_amplitude_dbm': '0.0 (nominal)',
            'observed_drift_ppb': '2.0 (nominal)',
          },
        },
      },
      {
        id: 'STS-PHY-002',
        name: 'Environmental Breach Detection',
        description:
          'Verifies that the engine rejects time sources operating outside their specified environmental evidence conditions (temperature/voltage anomalies).',
        status: 'passing',
        duration: 6,
        assertions: 1,
        details: {
          attackVector: 'Temperature/voltage side-channel manipulation',
          mitigation: 'Evidence condition validation (E envelope); rejection on "BREACH" keyword in evidence field',
          riskLevel: 'high',
          defenseLayer: 'Evidence Inspection (E)',
          parameters: {
            'evidence_field': 'Contains "BREACH" keyword',
            'envelope_valid': 'true',
          },
        },
      },
      {
        id: 'STS-PHY-004',
        name: 'Excessive Drift Rejection',
        description:
          'Verifies that the engine rejects observations with clock drift exceeding the 50.0 ppb tolerance threshold, even when all other conditions are valid.',
        status: 'passing',
        duration: 7,
        assertions: 1,
        details: {
          attackVector: 'Slow clock drift injection beyond physical tolerance bounds',
          mitigation: 'Drift magnitude check: |observed_drift_ppb| must be ≤ 50.0 ppb',
          riskLevel: 'high',
          defenseLayer: 'Physical Constraint: Drift Bound',
          parameters: {
            'observed_drift_ppb': '85.5 (exceeds 50.0 limit)',
            'drift_tolerance_ppb': '50.0',
            'physical_precision_ps': '0.5',
            'fractional_uncertainty': '1e-15',
          },
        },
      },
    ],
  },
  {
    id: 'contention',
    title: 'Multi-threaded Contention',
    icon: 'server',
    color: 'amber',
    description: 'Race conditions and state corruption under high-concurrency access to shared registries',
    tests: [
      {
        id: 'STS-MT-001',
        name: 'Registry Contention Fail-Open',
        description:
          'Simulates high-concurrency access to the lineage registry. Ensures contention does not lead to a fail-open state where unregistered lineages are accidentally accepted due to race conditions in the lookup table.',
        status: 'passing',
        duration: 45,
        assertions: 1,
        details: {
          attackVector: '100 concurrent threads racing lineage lookups via Mutex-guarded registry',
          mitigation: 'Atomic clone of registry on each read; thread-safe Mutex<Option<Vec<String>>>',
          riskLevel: 'high',
          defenseLayer: 'Thread-Safe Registry Access',
          parameters: {
            'thread_count': '100',
            'registry_type': 'Mutex<Option<Vec<String>>>',
            'access_pattern': 'Clone on read',
          },
        },
      },
    ],
  },
  {
    id: 'multisig',
    title: 'Multi-Signature Threshold',
    icon: 'key',
    color: 'cyan',
    description: 'Threshold signature verification ensuring minimum valid signatures before authority grant',
    tests: [
      {
        id: 'STS-MULTISIG-001',
        name: 'Threshold Failure Detection',
        description:
          'Verifies that the engine rejects observations when the number of discrete signature blocks falls below the configured multi-signature threshold (minimum 2 by default).',
        status: 'passing',
        duration: 9,
        assertions: 1,
        details: {
          attackVector: 'Insufficient signature blocks presented to bypass multi-party authorization',
          mitigation: 'Chunk-based signature counting (16-byte blocks); threshold comparison via Mutex-guarded counter',
          riskLevel: 'critical',
          defenseLayer: 'Multi-Sig Threshold Verification',
          parameters: {
            'threshold_required': '3',
            'signatures_provided': '1 (16-byte block)',
            'block_size': '16 bytes',
            'threshold_storage': 'Mutex<usize>',
          },
        },
      },
    ],
  },
];

// Precomputed lookup maps — built once at module load instead of repeatedly
// scanning the array on every render tick.
export const surfaceById = new Map(surfaceAreas.map((s) => [s.id, s]));
export const surfaceIdByTestId = new Map(
  surfaceAreas.flatMap((s) => s.tests.map((t) => [t.id, s.id] as const))
);
