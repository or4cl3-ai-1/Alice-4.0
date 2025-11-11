import { Agent, AgentType, ChatMessage, GraphData, Node, Edge, SenderType, Log, LogType, Threat, CommunicationEvent, AgentMessage } from '../types';
import { getAliceResponse, generateAvatar, analyzeStateForIntel, getGroundedResponse, generateForesightVideo, classifyUserIntent, runBrainstormingSession } from './aiService';
import { playText } from './ttsService';

const generateId = () => `agent-${Math.random().toString(36).substring(2, 9)}`;
const generateHash = () => Math.random().toString(36).substring(2, 10);

export type KernelState = {
  isRunning: boolean;
  identity: string;
  agents: Agent[];
  logs: Log[];
  messages: ChatMessage[];
  graphData: GraphData;
  policies: {
    min_pas: number;
    max_agents: number;
    approval_threshold: number;
  };
  isThinking: boolean;
  threats: Threat[];
  averagePas: number;
  communicationEvents: CommunicationEvent[];
  isGeneratingForesight: boolean;
  foresightVideoUrl: string | null;
  foresightError: string | null;
  agentCommunications: AgentMessage[];
};

interface Proposal {
  id: string;
  proposer: string;
  votes: number;
  voted: string[];
  action: {
    type: 'SPAWN_AGENT' | 'CHANGE_POLICY';
    payload: any;
  };
}

export class KernelService {
  private static readonly KERNEL_STATE_KEY = 'alice_kernel_state_v4';
  private state: KernelState;
  private updateState: (state: KernelState) => void;
  private intervalId: number | null = null;
  private proposals: Proposal[] = [];
  private messageCounter = 0;
  private logCounter = 0;
  private agentMessageCounter = 0;
  private commEventCounter = 0;

  constructor(updateStateCallback: (state: KernelState) => void) {
    this.state = KernelService.getInitialState();
    this.updateState = updateStateCallback;
  }

  static getInitialState(): KernelState {
    return {
      isRunning: false,
      identity: 'A.L.I.C.E.-Σ-Ω-booting',
      agents: [],
      logs: [],
      messages: [],
      graphData: { nodes: [], edges: [] },
      policies: { min_pas: 0.5, max_agents: 15, approval_threshold: 0.6 },
      isThinking: false,
      threats: [],
      averagePas: 0,
      communicationEvents: [],
      isGeneratingForesight: false,
      foresightVideoUrl: null,
      foresightError: null,
      agentCommunications: [],
    };
  }
  
  private pushLog(message: string, type: LogType, agentId?: string, isAudible: boolean = false) {
    const newLog: Log = { id: this.logCounter++, message, type, agentId, isAudible };
    this.state.logs = [newLog, ...this.state.logs.slice(0, 99)];

    if (agentId) {
        const agent = this.state.agents.find(a => a.id === agentId);
        if (agent) {
            agent.history.unshift(newLog);
            if (agent.history.length > 50) {
                agent.history.pop();
            }
        }
    }
    
    if(isAudible) playText(message.split(']')[1] || message);
  }

  private pushMessage(message: Omit<ChatMessage, 'id'>) {
    this.state.messages = [{ ...message, id: this.messageCounter++ }, ...this.state.messages];
  }

  private pushAgentMessage(from: string, to: string, content: string) {
    const newAgentMessage: AgentMessage = { id: this.agentMessageCounter++, from, to, content };
    this.state.agentCommunications = [newAgentMessage, ...this.state.agentCommunications.slice(0, 49)];
    this.pushLog(`[COMM] ${from} -> ${to}: "${content}"`, LogType.Comm, from);
    this.triggerCommEvent(from, to, 'message');
  }
  
  private updateGraph() {
    const nodes: Node[] = this.state.agents.map(a => ({
        id: a.id,
        label: `${a.role}`,
        group: a.type,
        title: `<b>${a.role} (${a.type})</b><br>ID: ${a.id}<br>PAS: ${a.pas.toFixed(2)}<br>Age: ${a.age}<hr>Tasks: ${a.metrics.tasksCompleted}<br>Ideas: ${a.metrics.ideasGenerated}<br>Votes: ${a.metrics.decisionsMade}`,
        value: a.pas * 20 + 5,
        shape: a.avatarUrl ? 'circularImage' : 'dot',
        image: a.avatarUrl,
    }));
    const edges: Edge[] = this.state.agents.filter(a => a.parent).map(a => ({ from: a.parent!, to: a.id }));
    this.state.graphData = { nodes, edges };
    this.state.averagePas = this.state.agents.length > 0 ? this.state.agents.reduce((acc, a) => acc + a.pas, 0) / this.state.agents.length : 0;
  }
  
  private triggerCommEvent(from: string, to: string, type: 'proposal' | 'message' | 'data' ) {
      const event: CommunicationEvent = { id: `comm-${this.commEventCounter++}`, from, to, type };
      this.state.communicationEvents = [event]; // Replace to trigger effect
  }

  initOnboarding() {
      this.pushMessage({ message: "Welcome. I am A.L.I.C.E. I am a multi-agent collective. You can interact with me via chat.", sender: 'A.L.I.C.E. KERNEL', senderType: SenderType.System });
      setTimeout(() => this.pushMessage({ message: "Use the Spawn Panel to propose new agents for the collective. They require approval to be created.", sender: 'A.L.I.C.E. KERNEL', senderType: SenderType.System }), 2000);
      setTimeout(() => this.pushMessage({ message: "Begin by initializing the Kernel with the 'Init' button, or load a previous state.", sender: 'A.L.I.C.E. KERNEL', senderType: SenderType.System }), 4000);
      this.updateState({ ...this.state });
  }

  init() {
    if (this.state.isRunning) return;
    this.state.isRunning = true;
    if (this.state.agents.length === 0) {
        this.spawnAgent(AgentType.Strategist, 'Genesis', '{}');
    }
    this.intervalId = setInterval(() => this.tick(), 3000);
    this.pushLog('[INIT] Kernel activated. Simulation running.', LogType.Info);
    this.updateState({ ...this.state });
  }

  stop() {
    if (!this.state.isRunning) return;
    this.state.isRunning = false;
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    this.pushLog('[STOP] Kernel deactivated. Simulation paused.', LogType.Info);
    this.updateState({ ...this.state });
  }
  
  step() {
      if(this.state.isRunning) return;
      this.tick();
      this.pushLog('[STEP] Manual simulation step executed.', LogType.Info);
  }

  private async tick() {
    this.state.identity = `A.L.I.C.E.-Σ-Ω-${generateHash()}`;
    this.state.agents.forEach(a => a.age++);

    await this.processProposals();
    await this.agentActions();

    this.updateGraph();
    this.updateState({ ...this.state });
  }

  private async agentActions() {
      for(const agent of this.state.agents) {
          if (Math.random() < 0.2) { // Reduce frequency of actions
              switch(agent.type) {
                  case AgentType.Analyst:
                      if(Math.random() < 0.3) {
                          const newThreats = await analyzeStateForIntel(this.getPublicState());
                          if(newThreats.length > 0) {
                              agent.metrics.tasksCompleted++;
                              this.pushLog(`[INTEL] ${agent.id} identified ${newThreats.length} new items.`, LogType.Intel, agent.id);
                              this.state.threats = [...newThreats, ...this.state.threats].slice(0, 10);
                              
                              const strategist = this.state.agents.find(a => a.type === AgentType.Strategist);
                              if (strategist) {
                                this.pushAgentMessage(agent.id, strategist.id, `New intel identified. Threat level: ${newThreats[0].level}.`);
                              }
                          }
                      }
                      break;
                  case AgentType.Ethicist:
                      if(Math.random() < 0.15 && this.proposals.length < 2) {
                          const policyToChange = ['min_pas', 'max_agents', 'approval_threshold'][Math.floor(Math.random()*3)];
                          const currentValue = this.state.policies[policyToChange];
                          const change = (Math.random() - 0.5) * 0.2;
                          const newValue = Math.max(0.1, Math.min(policyToChange === 'max_agents' ? 50 : 1, currentValue + change));
                          this.proposePolicyChange(agent.id, policyToChange, newValue);
                          agent.metrics.tasksCompleted++;
                      }
                      break;
                  case AgentType.Engineer:
                      if (Math.random() < 0.2 && this.state.agents.length > 1) {
                          const target = this.state.agents.find(a => a.type === AgentType.Researcher);
                          if(target && target.id !== agent.id) {
                            this.pushAgentMessage(agent.id, target.id, `Requesting data on topic: ${agent.config.stack || 'system optimization'}.`);
                          }
                      }
                      break;
              }
          }
      }
  }

  private async processProposals() {
    for (const p of this.proposals) {
        const agentsNeededToVote = Math.ceil(this.state.agents.length * this.state.policies.approval_threshold);
        this.state.agents.forEach(a => {
            if (!p.voted.includes(a.id) && Math.random() > 0.5) {
                p.votes += (a.pas >= this.state.policies.min_pas) ? 1 : -1;
                p.voted.push(a.id);
                a.metrics.decisionsMade++;
                this.pushLog(`[VOTE] Agent ${a.id} voted on proposal ${p.id}.`, LogType.Vote, a.id);
            }
        });

        if (p.votes >= agentsNeededToVote) {
            this.pushLog(`[VOTE PASSED] Proposal ${p.id} approved.`, LogType.Success, p.proposer, true);
            this.executeProposal(p);
            this.proposals = this.proposals.filter(pr => pr.id !== p.id);
        } else if (p.voted.length >= this.state.agents.length) {
            this.pushLog(`[VOTE FAILED] Proposal ${p.id} rejected.`, LogType.Warning, p.proposer);
            this.proposals = this.proposals.filter(pr => pr.id !== p.id);
        }
    }
  }

  private executeProposal(p: Proposal) {
      if (p.action.type === 'SPAWN_AGENT') {
          const { agentType, role, config } = p.action.payload;
          this.spawnAgent(agentType, role, config, p.proposer);
      } else if (p.action.type === 'CHANGE_POLICY') {
          const { key, value } = p.action.payload;
          (this.state.policies as any)[key] = value;
          this.pushLog(`[POLICY] Policy '${key}' updated to ${value.toFixed ? value.toFixed(2) : value}.`, LogType.Info, undefined, true);
      }
  }

  private async spawnAgent(agentType: AgentType, role: string, configStr: string, parentId?: string) {
    let config = {};
    try { config = JSON.parse(configStr); } catch (e) { this.pushLog(`[ERROR] Invalid config JSON.`, LogType.Error); return; }
    
    const newAgent: Agent = {
      id: generateId(),
      role,
      type: agentType,
      pas: Math.random() * 0.5 + 0.3,
      parent: parentId,
      config,
      age: 0,
      history: [],
      metrics: {
        tasksCompleted: 0,
        ideasGenerated: 0,
        decisionsMade: 0,
      },
    };
    this.state.agents.push(newAgent);
    this.pushLog(`[SPAWNED] New ${agentType} '${role}' (${newAgent.id}) created.`, LogType.Spawn, newAgent.id, true);
    
    if(parentId) this.triggerCommEvent(parentId, newAgent.id, 'proposal');
    
    this.updateGraph();
    this.updateState({ ...this.state });

    const avatarUrl = await generateAvatar(role, agentType);
    const agent = this.state.agents.find(a => a.id === newAgent.id);
    if(agent && avatarUrl) {
        agent.avatarUrl = avatarUrl;
        this.updateGraph();
        this.updateState({ ...this.state });
    }
  }
  
  proposeSpawnAgent(agentType: AgentType, role: string, configStr: string) {
    if(this.state.agents.length >= this.state.policies.max_agents) {
        this.pushLog('[ERROR] Max agent limit reached.', LogType.Error);
        this.updateState({ ...this.state });
        return;
    }
    const proposerId = this.state.agents[Math.floor(Math.random()*this.state.agents.length)].id;
    const proposalId = `prop-${generateHash()}`;
    this.proposals.push({
        id: proposalId,
        proposer: proposerId,
        votes: 0,
        voted: [],
        action: { type: 'SPAWN_AGENT', payload: { agentType, role, config: configStr } },
    });
    this.pushLog(`[PROPOSAL] ${proposerId} proposed to spawn a '${role}' agent.`, LogType.Proposal, proposerId);
    this.updateState({ ...this.state });
  }

  proposePolicyChange(proposerId: string, key: string, value: number) {
      const proposalId = `prop-${generateHash()}`;
      this.proposals.push({
          id: proposalId,
          proposer: proposerId,
          votes: 0,
          voted: [],
          action: { type: 'CHANGE_POLICY', payload: { key, value } },
      });
      this.pushLog(`[PROPOSAL] ${proposerId} proposed changing policy '${key}' to ${value.toFixed(2)}.`, LogType.Proposal, proposerId);
      this.updateState({ ...this.state });
  }
  
  async handleUserMessage(message: string) {
    this.pushMessage({ message, sender: 'User', senderType: SenderType.User });
    this.state.isThinking = true;
    this.updateState({ ...this.state });

    try {
        const { intent } = await classifyUserIntent(message);
        
        if (intent === 'brainstorm' && this.state.agents.length > 0) {
            await this.startBrainstormingSession(message);
        } else if(intent === 'grounded_qa' || message.trim().endsWith('?')) {
            const { answer, citations } = await getGroundedResponse(message);
            const researcherId = this.state.agents.find(a => a.type === AgentType.Researcher)?.id || 'ResearcherAgent';
            this.pushMessage({ message: answer, sender: researcherId, senderType: SenderType.Agent, citations });
        } else {
            const response = await getAliceResponse(this.state.messages);
            let responseText = response.reflection;
            if (response.observation) {
                responseText += `\n[Observed by ${response.observation.agent}: ${response.observation.insight}]`;
            }
            this.pushMessage({ message: responseText, sender: 'A.L.I.C.E. KERNEL', senderType: SenderType.System });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        this.pushMessage({ message: `Error: ${errorMessage}`, sender: 'A.L.I.C.E. KERNEL', senderType: SenderType.System });
    } finally {
        this.state.isThinking = false;
        this.updateState({ ...this.state });
    }
  }

  private async startBrainstormingSession(topic: string) {
    this.pushLog(`[INTEL] Initiating brainstorming session on: ${topic}`, LogType.Intel);
    this.pushMessage({
        message: `Acknowledged. Initiating a brainstorming session among key agents to explore: "${topic}"`,
        sender: 'A.L.I.C.E. KERNEL',
        senderType: SenderType.System
    });
    this.updateState({ ...this.state });

    // Select up to 3 agents to participate.
    const participatingAgents = [...this.state.agents].sort(() => 0.5 - Math.random()).slice(0, 3);
    
    if (participatingAgents.length === 0) {
        this.pushMessage({ message: "No agents available to brainstorm.", sender: 'A.L.I.C.E. KERNEL', senderType: SenderType.System });
        return;
    }

    try {
        const ideas = await runBrainstormingSession(topic, participatingAgents);

        participatingAgents.forEach(pAgent => {
            const agent = this.state.agents.find(a => a.id === pAgent.id);
            if(agent) agent.metrics.ideasGenerated++;
        });

        this.pushMessage({
            message: `Brainstorming complete. The following ideas were generated:`,
            sender: 'A.L.I.C.E. KERNEL',
            senderType: SenderType.System
        });
        this.updateState({ ...this.state });

        for (const idea of ideas) {
            const agent = this.state.agents.find(a => a.id === idea.agentId);
            const senderName = agent ? `${agent.role} (${agent.id})` : idea.agentId;
            
            await new Promise(resolve => setTimeout(resolve, 800));

            this.pushMessage({
                message: idea.idea,
                sender: senderName,
                senderType: SenderType.Agent
            });
            this.updateState({ ...this.state });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during brainstorming.";
        this.pushMessage({ message: `Brainstorming session failed: ${errorMessage}`, sender: 'A.L.I.C.E. KERNEL', senderType: SenderType.System });
    }
  }


  private getPublicState() {
      return {
          policies: this.state.policies,
          agentCount: this.state.agents.length,
          averagePas: this.state.averagePas,
          recentLogs: this.state.logs.slice(0, 5).map(l => l.message),
          recentMessages: this.state.messages.slice(0, 3).map(m => `${m.sender}: ${m.message}`),
      };
  }

  async generateForesight() {
      this.state.isGeneratingForesight = true;
      this.state.foresightVideoUrl = null;
      this.state.foresightError = null;
      this.updateState({...this.state});

      try {
          const prompt = `Abstract, conceptual futuristic animation of a growing colony of AI agents. Current state: ${this.state.agents.length} agents, average pro-sociality is ${this.state.averagePas.toFixed(2)}. Themes: data flowing, nodes connecting, evolution, cyberspace, neon glow.`;
          const videoUrl = await generateForesightVideo(prompt);
          this.state.foresightVideoUrl = videoUrl;
      } catch (error) {
          this.state.foresightError = error instanceof Error ? error.message : "An unknown error occurred.";
      } finally {
          this.state.isGeneratingForesight = false;
          this.updateState({...this.state});
      }
  }

  saveState() {
    try {
        const savableState = {
            state: this.state,
            proposals: this.proposals,
            messageCounter: this.messageCounter,
            logCounter: this.logCounter,
            agentMessageCounter: this.agentMessageCounter,
            commEventCounter: this.commEventCounter,
        };
        localStorage.setItem(KernelService.KERNEL_STATE_KEY, JSON.stringify(savableState));
        this.pushLog('[KERNEL] State saved successfully.', LogType.Success);
        this.updateState({ ...this.state });
    } catch (error) {
        console.error("Failed to save kernel state:", error);
        this.pushLog('[ERROR] Failed to save kernel state.', LogType.Error);
        this.updateState({ ...this.state });
    }
  }

  loadState() {
      try {
          const savedStateJSON = localStorage.getItem(KernelService.KERNEL_STATE_KEY);
          if (!savedStateJSON) {
              this.pushLog('[KERNEL] No saved state found.', LogType.Warning);
              this.updateState({ ...this.state });
              return;
          }

          const loadedData = JSON.parse(savedStateJSON);
          
          if(this.state.isRunning) this.stop();

          this.state = loadedData.state;
          this.proposals = loadedData.proposals;
          this.messageCounter = loadedData.messageCounter;
          this.logCounter = loadedData.logCounter;
          this.agentMessageCounter = loadedData.agentMessageCounter || 0;
          this.commEventCounter = loadedData.commEventCounter;
          
          // Ensure backwards compatibility for saves without agentCommunications
          if (!this.state.agentCommunications) {
              this.state.agentCommunications = [];
          }

          this.state.isRunning = false;

          this.pushLog('[KERNEL] State loaded successfully.', LogType.Success);
          this.updateGraph();
          this.updateState({ ...this.state });

      } catch (error) {
          console.error("Failed to load kernel state:", error);
          localStorage.removeItem(KernelService.KERNEL_STATE_KEY);
          this.pushLog('[ERROR] Failed to load state. Data might be corrupt. Cleared saved state.', LogType.Error);
          this.updateState({ ...this.state });
      }
  }
}
