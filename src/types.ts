export interface TestResult {
  testId: string;
  testName: string;
  surfaceId: string;
  status: 'passing' | 'failing' | 'running' | 'pending';
  duration: number;
  timestamp: number;
}

export interface SurfaceArea {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  tests: TestCase[];
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  status: 'passing' | 'failing';
  duration: number;
  assertions: number;
  details: TestDetails;
}

export interface TestDetails {
  attackVector: string;
  mitigation: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  defenseLayer?: string;
  parameters?: Record<string, string>;
}
