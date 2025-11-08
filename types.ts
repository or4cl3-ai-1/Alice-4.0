
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
}

export interface Agent {
  id: string;
  role: string;
  type: AgentType;
  pas: number; // Pro-sociality Score
  parent?: string;
  config: Record<string, any>;
  age: number;
}

export interface Node {
  id:string;
  label: string;
  group: string;
  title: string;
  value: number;
}

export interface Edge {
  from: string;
  to: string;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}
