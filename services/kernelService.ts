
import { Agent, AgentType, ChatMessage, GraphData, Node, Edge, SenderType } from '../types';
import { getAliceResponse } from './aiService';

// Simple unique ID generator
const generateId = () => `agent-${Math.random().toString(36).substring(2, 10)}`;
const generateHash = () => Math.random().toString(36).substring(2, 10);

export type KernelState = {
  isRunning: boolean;
  identity: string;
  agents: Agent[];
  logs: string[];
  messages: ChatMessage[];
  graphData: GraphData;
  policies: {
    min_pas: number;
    max_agents: number;
    approval_threshold: number;
  };
  isThinking: boolean;
};

interface SpawnProposal {
  id: string;
  agentType: AgentType;
  role: string;
  config: string;
  votes: number;
  voted: string[]; // agent IDs that have voted
}

export class KernelService {
  private state: KernelState;
  private updateState: (state: KernelState) => void;
  private intervalId: number | null = null;
  private proposals: SpawnProposal[] = [];
  private messageCounter = 0;

  constructor(updateStateCallback: (state: KernelState) => void) {
    this.state = KernelService.getInitialState();
    this.updateState = updateStateCallback;
  }

  static getInitialState(): KernelState {
    return {
      isRunning: false,
      identity: 'A.L.I.C.E.-Σ-Ω-booting',
      agents: [],
      logs: ['[INIT] Kernel standing by.'],
      messages: [],
      graphData: { nodes: [], edges: [] },
      policies: {
        min_pas: 0.5,
        max_agents: 15,
        approval_threshold: 0.6,
      },
      isThinking: false,
    };
  }
  
  private pushLog(log: string) {
    this.state.logs = [log, ...this.state.logs.slice(0, 99)];
  }

  private pushMessage(message: Omit<ChatMessage, 'id'>) {
    this.state.messages = [{ ...message, id: this.messageCounter++ }, ...this.state.messages];
  }
  
  private updateGraph() {
    const nodes: Node[] = this.state.agents.map(a => ({
        id: a.id,
        label: `${a.role}\n(${a.type})`,
        group: a.type,
        title: `ID: ${a.id}<br>PAS: ${a.pas.toFixed(2)}<br>Age: ${a.age}`,
        value: a.pas * 20 + 5,
    }));

    const edges: Edge[] = this.state.agents
      .filter(a => a.parent)
      .map(a => ({ from: a.parent!, to: a.id }));
    
    this.state.graphData = { nodes, edges };
  }

  init() {
    if (this.state.isRunning) return;
    this.state.isRunning = true;
    
    // Create Genesis Agent
    if (this.state.agents.length === 0) {
        const genesisAgent: Agent = {
            id: generateId(),
            role: 'Genesis',
            type: AgentType.Strategist,
            pas: 0.9,
            config: {},
            age: 0,
        };
        this.state.agents.push(genesisAgent);
        this.pushLog(`[SPAWNED] Genesis agent ${genesisAgent.id} created.`);
        this.updateGraph();
    }

    this.intervalId = setInterval(() => this.tick(), 2000);
    this.pushLog('[INIT] Kernel activated. Simulation running.');
    this.updateState({ ...this.state });
  }

  stop() {
    if (!this.state.isRunning) return;
    this.state.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.pushLog('[STOP] Kernel deactivated. Simulation paused.');
    this.updateState({ ...this.state });
  }
  
  step() {
      if(this.state.isRunning) return;
      this.tick();
      this.pushLog('[STEP] Manual simulation step executed.');
  }

  private tick() {
    // 1. Update identity
    this.state.identity = `A.L.I.C.E.-Σ-Ω-${generateHash()}`;

    // 2. Age agents
    this.state.agents.forEach(a => a.age++);

    // 3. Process proposals
    this.proposals.forEach(p => {
        const agentsNeededToVote = Math.ceil(this.state.agents.length * this.state.policies.approval_threshold);
        // Randomly have some agents vote
        this.state.agents.forEach(a => {
            if (!p.voted.includes(a.id) && Math.random() > 0.5) {
                if(a.pas >= this.state.policies.min_pas) {
                    p.votes++;
                    this.pushLog(`[VOTE] Agent ${a.id} approved proposal ${p.id}.`);
                } else {
                    this.pushLog(`[VOTE] Agent ${a.id} rejected proposal ${p.id}.`);
                }
                p.voted.push(a.id);
            }
        });

        if (p.votes >= agentsNeededToVote) {
             // PASSED
            this.spawnAgent(p.agentType, p.role, p.config, this.state.agents[Math.floor(Math.random()*this.state.agents.length)].id);
            this.pushLog(`[VOTE] PASSED: Proposal ${p.id} approved with ${p.votes} votes.`);
            this.proposals = this.proposals.filter(pr => pr.id !== p.id);
        } else if (p.voted.length >= this.state.agents.length) {
            // FAILED
            this.pushLog(`[VOTE] FAILED: Proposal ${p.id} failed with ${p.votes}/${agentsNeededToVote} votes.`);
            this.proposals = this.proposals.filter(pr => pr.id !== p.id);
        }
    });

    // 4. Randomly evolve an agent
    if (Math.random() < 0.1 && this.state.agents.length > 0) {
        const agent = this.state.agents[Math.floor(Math.random() * this.state.agents.length)];
        agent.pas = Math.min(1, agent.pas + (Math.random() - 0.4) * 0.1);
        this.pushLog(`[EVOLVED] Agent ${agent.id} PAS score is now ${agent.pas.toFixed(2)}.`);
    }

    this.updateGraph();
    this.updateState({ ...this.state });
  }

  private spawnAgent(agentType: AgentType, role: string, configStr: string, parentId?: string) {
    let config = {};
    try {
        config = JSON.parse(configStr);
    } catch (e) {
        this.pushLog(`[ERROR] Invalid config JSON for role ${role}.`);
        return;
    }
    const newAgent: Agent = {
      id: generateId(),
      role,
      type: agentType,
      pas: Math.random() * 0.5 + 0.3, // Start with a mid-range PAS
      parent: parentId,
      config,
      age: 0,
    };
    this.state.agents.push(newAgent);
    this.pushLog(`[SPAWNED] New ${agentType} agent '${role}' (${newAgent.id}) created.`);
    this.updateGraph();
    this.updateState({ ...this.state });
  }
  
  proposeSpawnAgent(agentType: AgentType, role: string, configStr: string) {
    if(this.state.agents.length >= this.state.policies.max_agents) {
        this.pushLog('[ERROR] Max agent limit reached. Cannot create proposal.');
        this.updateState({ ...this.state });
        return;
    }

    const proposalId = `prop-${generateHash()}`;
    const newProposal: SpawnProposal = {
        id: proposalId,
        agentType,
        role,
        config: configStr,
        votes: 0,
        voted: [],
    };
    this.proposals.push(newProposal);
    this.pushLog(`[PROPOSAL] Proposal ${proposalId} submitted to spawn a '${role}' agent. Voting begins.`);
    this.updateState({ ...this.state });
  }

  async handleUserMessage(message: string) {
    this.pushMessage({ message, sender: 'User', senderType: SenderType.User });
    this.state.isThinking = true;
    this.updateState({ ...this.state });

    try {
        const responseText = await getAliceResponse(this.state.messages, message);
        this.pushMessage({ message: responseText, sender: 'A.L.I.C.E. KERNEL', senderType: SenderType.System });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        this.pushMessage({ message: `Error from collective: ${errorMessage}`, sender: 'A.L.I.C.E. KERNEL', senderType: SenderType.System });
    } finally {
        this.state.isThinking = false;
        this.updateState({ ...this.state });
    }
  }
}
