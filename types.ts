export enum AgentType {
  Researcher = 'Researcher',
  Engineer = 'Engineer',
  Analyst = 'Analyst',
  Strategist = 'Strategist',
  Ethicist = 'Ethicist',
}

export enum SenderType {
  User = 'USER',
  Agent = 'AGENT',
  System = 'SYSTEM',
}

export interface ChatMessage {
  id: number;
  message: string;
  sender: string; // 'USER', agent ID, or 'A.L.I.C.E. KERNEL'
  senderType: SenderType;
  citations?: { uri: string, title: string }[];
}

export interface AgentMessage {
  id: number;
  from: string; // Agent ID
  to: string; // Agent ID
  content: string;
}

export interface Agent {
  id: string;
  role: string;
  type: AgentType;
  pas: number; // Pro-sociality Score
  parent?: string;
  config: Record<string, any>;
  age: number;
  history: Log[];
  avatarUrl?: string;
  metrics: {
    tasksCompleted: number;
    ideasGenerated: number;
    decisionsMade: number;
  };
}

export interface Node {
  id: string;
  label: string;
  group: string;
  title: string;
  value: number;
  shape: 'dot' | 'image' | 'circularImage';
  image?: string;
}

export interface Edge {
  from: string;
  to: string;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export enum LogType {
    Info = 'INFO',
    Success = 'SUCCESS',
    Warning = 'WARNING',
    Error = 'ERROR',
    Proposal = 'PROPOSAL',
    Vote = 'VOTE',
    Evolve = 'EVOLVE',
    Spawn = 'SPAWN',
    Intel = 'INTEL',
    Comm = 'COMM',
}

export interface Log {
    id: number;
    message: string;
    type: LogType;
    agentId?: string;
    isAudible?: boolean;
}

export enum ThreatLevel {
    Low = 'LOW',
    Medium = 'MEDIUM',
    High = 'HIGH',
    Critical = 'CRITICAL',
}

export interface Threat {
    id: string;
    level: ThreatLevel;
    description: string;
    source: string; // Agent ID
}

export interface CommunicationEvent {
  id: string;
  from: string;
  to: string;
  type: 'proposal' | 'message' | 'data';
}

export interface BrainstormIdea {
  agentId: string;
  idea: string;
}
