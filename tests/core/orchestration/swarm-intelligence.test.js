/**
 * Swarm Intelligence Tests
 * Story ORCH-5 - Emergent intelligence from multi-agent collaboration
 *
 * 40+ test cases covering all methods, voting strategies, edge cases
 */

const path = require('path');
const fs = require('fs').promises;

const SwarmIntelligence = require('../../../.aiox-core/core/orchestration/swarm-intelligence');
const {
  VOTING_STRATEGIES,
  PROPOSAL_STATUS,
  SWARM_STATUS,
  LEADER_CRITERIA,
  VOTE_OPTIONS,
} = SwarmIntelligence;

// Test fixtures
const TEST_PROJECT_ROOT = path.join(__dirname, '../../fixtures/test-project-swarm');

describe('SwarmIntelligence', () => {
  let si;

  beforeEach(async () => {
    try {
      await fs.rm(TEST_PROJECT_ROOT, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
    await fs.mkdir(TEST_PROJECT_ROOT, { recursive: true });

    si = new SwarmIntelligence(TEST_PROJECT_ROOT, { persist: false, debug: false });
  });

  afterEach(async () => {
    si.removeAllListeners();
    try {
      await fs.rm(TEST_PROJECT_ROOT, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          CONSTRUCTOR
  // ═══════════════════════════════════════════════════════════════════════════

  describe('constructor', () => {
    it('should create instance with valid projectRoot', () => {
      expect(si).toBeInstanceOf(SwarmIntelligence);
      expect(si.projectRoot).toBe(TEST_PROJECT_ROOT);
      expect(si.swarms.size).toBe(0);
    });

    it('should throw if projectRoot is missing', () => {
      expect(() => new SwarmIntelligence()).toThrow('projectRoot is required');
    });

    it('should throw if projectRoot is not a string', () => {
      expect(() => new SwarmIntelligence(123)).toThrow('projectRoot is required');
    });

    it('should use ?? for defaults (persist=true, debug=false)', () => {
      const instance = new SwarmIntelligence(TEST_PROJECT_ROOT);
      expect(instance.options.persist).toBe(true);
      expect(instance.options.debug).toBe(false);
    });

    it('should be an EventEmitter', () => {
      expect(typeof si.on).toBe('function');
      expect(typeof si.emit).toBe('function');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          SWARM MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createSwarm', () => {
    it('should create a swarm with default config', () => {
      const swarm = si.createSwarm('alpha-team');
      expect(swarm.name).toBe('alpha-team');
      expect(swarm.id).toBeDefined();
      expect(swarm.status).toBe(SWARM_STATUS.ACTIVE);
      expect(swarm.agents).toBeInstanceOf(Map);
      expect(swarm.agents.size).toBe(0);
      expect(swarm.config.votingStrategy).toBe(VOTING_STRATEGIES.MAJORITY);
      expect(swarm.config.consensusThreshold).toBe(0.6);
      expect(swarm.config.minAgents).toBe(2);
      expect(swarm.config.maxAgents).toBe(50);
    });

    it('should create swarm with custom config', () => {
      const swarm = si.createSwarm('beta-team', {
        minAgents: 3,
        maxAgents: 10,
        consensusThreshold: 0.8,
        votingStrategy: 'weighted',
      });
      expect(swarm.config.minAgents).toBe(3);
      expect(swarm.config.maxAgents).toBe(10);
      expect(swarm.config.consensusThreshold).toBe(0.8);
      expect(swarm.config.votingStrategy).toBe('weighted');
    });

    it('should emit swarm:created event', () => {
      const handler = jest.fn();
      si.on('swarm:created', handler);
      const swarm = si.createSwarm('test-swarm');
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ swarmId: swarm.id, name: 'test-swarm' })
      );
    });

    it('should throw for missing name', () => {
      expect(() => si.createSwarm()).toThrow('Swarm name is required');
    });

    it('should throw for invalid voting strategy', () => {
      expect(() => si.createSwarm('bad', { votingStrategy: 'invalid' }))
        .toThrow('Invalid voting strategy');
    });

    it('should throw for invalid consensusThreshold', () => {
      expect(() => si.createSwarm('bad', { consensusThreshold: 1.5 }))
        .toThrow('consensusThreshold must be a number between 0 and 1');
    });

    it('should throw if maxAgents < minAgents', () => {
      expect(() => si.createSwarm('bad', { minAgents: 10, maxAgents: 5 }))
        .toThrow('maxAgents must be >= minAgents');
    });

    it('should throw if minAgents < 1', () => {
      expect(() => si.createSwarm('bad', { minAgents: 0 }))
        .toThrow('minAgents must be at least 1');
    });

    it('should increment swarmsCreated stat', () => {
      si.createSwarm('s1');
      si.createSwarm('s2');
      expect(si.getStats().swarmsCreated).toBe(2);
    });
  });

  describe('joinSwarm', () => {
    let swarm;

    beforeEach(() => {
      swarm = si.createSwarm('test-swarm', { maxAgents: 3 });
    });

    it('should add an agent to the swarm', () => {
      si.joinSwarm(swarm.id, 'agent-1', ['coding', 'testing']);
      expect(swarm.agents.size).toBe(1);
      const agent = swarm.agents.get('agent-1');
      expect(agent.capabilities).toEqual(['coding', 'testing']);
      expect(agent.reputation).toBe(1.0);
      expect(agent.votesCount).toBe(0);
    });

    it('should emit swarm:joined event', () => {
      const handler = jest.fn();
      si.on('swarm:joined', handler);
      si.joinSwarm(swarm.id, 'agent-1', ['coding']);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ swarmId: swarm.id, agentId: 'agent-1' })
      );
    });

    it('should throw if agent already joined', () => {
      si.joinSwarm(swarm.id, 'agent-1');
      expect(() => si.joinSwarm(swarm.id, 'agent-1'))
        .toThrow('already a member');
    });

    it('should throw if swarm is at max capacity', () => {
      si.joinSwarm(swarm.id, 'agent-1');
      si.joinSwarm(swarm.id, 'agent-2');
      si.joinSwarm(swarm.id, 'agent-3');
      expect(() => si.joinSwarm(swarm.id, 'agent-4'))
        .toThrow('maximum capacity');
    });

    it('should throw for invalid agentId', () => {
      expect(() => si.joinSwarm(swarm.id, ''))
        .toThrow('agentId is required');
    });

    it('should throw for non-existent swarm', () => {
      expect(() => si.joinSwarm('fake-id', 'agent-1'))
        .toThrow('Swarm not found');
    });
  });

  describe('leaveSwarm', () => {
    let swarm;

    beforeEach(() => {
      swarm = si.createSwarm('test-swarm');
      si.joinSwarm(swarm.id, 'agent-1');
      si.joinSwarm(swarm.id, 'agent-2');
    });

    it('should remove agent from swarm', () => {
      si.leaveSwarm(swarm.id, 'agent-1');
      expect(swarm.agents.size).toBe(1);
      expect(swarm.agents.has('agent-1')).toBe(false);
    });

    it('should clear leader if leader leaves', () => {
      swarm.leader = 'agent-1';
      si.leaveSwarm(swarm.id, 'agent-1');
      expect(swarm.leader).toBeNull();
    });

    it('should emit swarm:left event', () => {
      const handler = jest.fn();
      si.on('swarm:left', handler);
      si.leaveSwarm(swarm.id, 'agent-1');
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ swarmId: swarm.id, agentId: 'agent-1' })
      );
    });

    it('should throw if agent is not a member', () => {
      expect(() => si.leaveSwarm(swarm.id, 'unknown-agent'))
        .toThrow('not a member');
    });
  });

  describe('dissolveSwarm', () => {
    it('should dissolve an active swarm', () => {
      const swarm = si.createSwarm('ephemeral');
      si.joinSwarm(swarm.id, 'agent-1');

      const summary = si.dissolveSwarm(swarm.id);
      expect(summary.name).toBe('ephemeral');
      expect(summary.agentCount).toBe(1);
      expect(swarm.status).toBe(SWARM_STATUS.DISSOLVED);
    });

    it('should emit swarm:dissolved event', () => {
      const handler = jest.fn();
      si.on('swarm:dissolved', handler);
      const swarm = si.createSwarm('temp');
      si.dissolveSwarm(swarm.id);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ swarmId: swarm.id })
      );
    });

    it('should prevent operations on dissolved swarm', () => {
      const swarm = si.createSwarm('temp');
      si.dissolveSwarm(swarm.id);
      expect(() => si.joinSwarm(swarm.id, 'agent-1'))
        .toThrow('not active');
    });

    it('should increment swarmsDissolved stat', () => {
      const swarm = si.createSwarm('temp');
      si.dissolveSwarm(swarm.id);
      expect(si.getStats().swarmsDissolved).toBe(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          DECISION MAKING
  // ═══════════════════════════════════════════════════════════════════════════

  describe('proposeDecision', () => {
    let swarm;

    beforeEach(() => {
      swarm = si.createSwarm('decision-swarm');
      si.joinSwarm(swarm.id, 'agent-1');
    });

    it('should create a proposal', () => {
      const proposal = si.proposeDecision(swarm.id, {
        description: 'Use TypeScript',
        proposedBy: 'agent-1',
        type: 'architecture',
      });
      expect(proposal.id).toBeDefined();
      expect(proposal.description).toBe('Use TypeScript');
      expect(proposal.proposedBy).toBe('agent-1');
      expect(proposal.type).toBe('architecture');
      expect(proposal.status).toBe(PROPOSAL_STATUS.PENDING);
      expect(proposal.votes).toBeInstanceOf(Map);
    });

    it('should emit proposal:created event', () => {
      const handler = jest.fn();
      si.on('proposal:created', handler);
      si.proposeDecision(swarm.id, {
        description: 'Test proposal',
        proposedBy: 'agent-1',
      });
      expect(handler).toHaveBeenCalled();
    });

    it('should throw if proposer is not a member', () => {
      expect(() => si.proposeDecision(swarm.id, {
        description: 'Bad proposal',
        proposedBy: 'outsider',
      })).toThrow('not a member');
    });

    it('should throw if description is missing', () => {
      expect(() => si.proposeDecision(swarm.id, {
        proposedBy: 'agent-1',
      })).toThrow('description is required');
    });

    it('should default type to general', () => {
      const proposal = si.proposeDecision(swarm.id, {
        description: 'A thing',
        proposedBy: 'agent-1',
      });
      expect(proposal.type).toBe('general');
    });
  });

  describe('vote', () => {
    let swarm;
    let proposal;

    beforeEach(() => {
      swarm = si.createSwarm('vote-swarm');
      si.joinSwarm(swarm.id, 'agent-1');
      si.joinSwarm(swarm.id, 'agent-2');
      si.joinSwarm(swarm.id, 'agent-3');
      proposal = si.proposeDecision(swarm.id, {
        description: 'Should we deploy?',
        proposedBy: 'agent-1',
      });
    });

    it('should record a vote', () => {
      si.vote(swarm.id, proposal.id, 'agent-1', 'approve', 0.9);
      expect(proposal.votes.size).toBe(1);
      const v = proposal.votes.get('agent-1');
      expect(v.vote).toBe('approve');
      expect(v.confidence).toBe(0.9);
    });

    it('should emit proposal:voted event', () => {
      const handler = jest.fn();
      si.on('proposal:voted', handler);
      si.vote(swarm.id, proposal.id, 'agent-1', 'reject', 0.5);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          swarmId: swarm.id,
          proposalId: proposal.id,
          agentId: 'agent-1',
          vote: 'reject',
          confidence: 0.5,
        })
      );
    });

    it('should throw if agent already voted', () => {
      si.vote(swarm.id, proposal.id, 'agent-1', 'approve');
      expect(() => si.vote(swarm.id, proposal.id, 'agent-1', 'reject'))
        .toThrow('already voted');
    });

    it('should throw for invalid vote value', () => {
      expect(() => si.vote(swarm.id, proposal.id, 'agent-1', 'maybe'))
        .toThrow('Invalid vote');
    });

    it('should throw for invalid confidence', () => {
      expect(() => si.vote(swarm.id, proposal.id, 'agent-1', 'approve', 1.5))
        .toThrow('confidence must be a number between 0 and 1');
    });

    it('should throw if agent is not a member', () => {
      expect(() => si.vote(swarm.id, proposal.id, 'outsider', 'approve'))
        .toThrow('not a member');
    });

    it('should default confidence to 1.0', () => {
      si.vote(swarm.id, proposal.id, 'agent-2', 'approve');
      const v = proposal.votes.get('agent-2');
      expect(v.confidence).toBe(1.0);
    });

    it('should increment agent votesCount', () => {
      si.vote(swarm.id, proposal.id, 'agent-1', 'approve');
      expect(swarm.agents.get('agent-1').votesCount).toBe(1);
    });

    it('should reject vote on expired proposal', () => {
      // Force deadline to past
      proposal.deadline = new Date(Date.now() - 1000).toISOString();
      expect(() => si.vote(swarm.id, proposal.id, 'agent-1', 'approve'))
        .toThrow('has expired');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          VOTING STRATEGIES
  // ═══════════════════════════════════════════════════════════════════════════

  describe('resolveProposal - majority strategy', () => {
    it('should approve with majority approvals', () => {
      const swarm = si.createSwarm('majority-swarm', { votingStrategy: 'majority' });
      si.joinSwarm(swarm.id, 'a1');
      si.joinSwarm(swarm.id, 'a2');
      si.joinSwarm(swarm.id, 'a3');

      const p = si.proposeDecision(swarm.id, { description: 'test', proposedBy: 'a1' });
      si.vote(swarm.id, p.id, 'a1', 'approve');
      si.vote(swarm.id, p.id, 'a2', 'approve');
      si.vote(swarm.id, p.id, 'a3', 'reject');

      const result = si.resolveProposal(swarm.id, p.id);
      expect(result.status).toBe(PROPOSAL_STATUS.APPROVED);
      expect(result.approved).toBe(true);
      expect(result.approveCount).toBe(2);
      expect(result.rejectCount).toBe(1);
    });

    it('should reject without majority', () => {
      const swarm = si.createSwarm('majority-swarm', { votingStrategy: 'majority' });
      si.joinSwarm(swarm.id, 'a1');
      si.joinSwarm(swarm.id, 'a2');
      si.joinSwarm(swarm.id, 'a3');

      const p = si.proposeDecision(swarm.id, { description: 'test', proposedBy: 'a1' });
      si.vote(swarm.id, p.id, 'a1', 'approve');
      si.vote(swarm.id, p.id, 'a2', 'reject');
      si.vote(swarm.id, p.id, 'a3', 'reject');

      const result = si.resolveProposal(swarm.id, p.id);
      expect(result.status).toBe(PROPOSAL_STATUS.REJECTED);
      expect(result.approved).toBe(false);
    });

    it('should handle abstain votes (majority of non-abstain)', () => {
      const swarm = si.createSwarm('majority-swarm', { votingStrategy: 'majority' });
      si.joinSwarm(swarm.id, 'a1');
      si.joinSwarm(swarm.id, 'a2');
      si.joinSwarm(swarm.id, 'a3');

      const p = si.proposeDecision(swarm.id, { description: 'test', proposedBy: 'a1' });
      si.vote(swarm.id, p.id, 'a1', 'approve');
      si.vote(swarm.id, p.id, 'a2', 'abstain');
      si.vote(swarm.id, p.id, 'a3', 'abstain');

      const result = si.resolveProposal(swarm.id, p.id);
      expect(result.approved).toBe(true); // 1 approve, 0 reject = majority
    });
  });

  describe('resolveProposal - weighted strategy', () => {
    it('should weight votes by confidence and reputation', () => {
      const swarm = si.createSwarm('weighted-swarm', { votingStrategy: 'weighted' });
      si.joinSwarm(swarm.id, 'expert', ['ml', 'data-science', 'python']);
      si.joinSwarm(swarm.id, 'junior', ['python']);

      // Boost expert reputation
      swarm.agents.get('expert').reputation = 2.0;
      swarm.agents.get('junior').reputation = 0.5;

      const p = si.proposeDecision(swarm.id, { description: 'use ML', proposedBy: 'expert' });
      si.vote(swarm.id, p.id, 'expert', 'approve', 1.0); // weight = 1.0 * 2.0 = 2.0
      si.vote(swarm.id, p.id, 'junior', 'reject', 0.8);  // weight = 0.8 * 0.5 = 0.4

      const result = si.resolveProposal(swarm.id, p.id);
      expect(result.approved).toBe(true);
      expect(result.approveWeight).toBe(2.0);
      expect(result.rejectWeight).toBe(0.4);
    });

    it('should reject when reject weight exceeds approve weight', () => {
      const swarm = si.createSwarm('weighted-swarm', { votingStrategy: 'weighted' });
      si.joinSwarm(swarm.id, 'a1');
      si.joinSwarm(swarm.id, 'a2');

      swarm.agents.get('a1').reputation = 0.5;
      swarm.agents.get('a2').reputation = 2.0;

      const p = si.proposeDecision(swarm.id, { description: 'test', proposedBy: 'a1' });
      si.vote(swarm.id, p.id, 'a1', 'approve', 0.5); // weight = 0.25
      si.vote(swarm.id, p.id, 'a2', 'reject', 1.0);   // weight = 2.0

      const result = si.resolveProposal(swarm.id, p.id);
      expect(result.approved).toBe(false);
    });
  });

  describe('resolveProposal - unanimous strategy', () => {
    it('should approve when all non-abstain votes approve', () => {
      const swarm = si.createSwarm('unanimous-swarm', { votingStrategy: 'unanimous' });
      si.joinSwarm(swarm.id, 'a1');
      si.joinSwarm(swarm.id, 'a2');
      si.joinSwarm(swarm.id, 'a3');

      const p = si.proposeDecision(swarm.id, { description: 'test', proposedBy: 'a1' });
      si.vote(swarm.id, p.id, 'a1', 'approve');
      si.vote(swarm.id, p.id, 'a2', 'approve');
      si.vote(swarm.id, p.id, 'a3', 'abstain');

      const result = si.resolveProposal(swarm.id, p.id);
      expect(result.approved).toBe(true);
    });

    it('should reject if any non-abstain vote is reject', () => {
      const swarm = si.createSwarm('unanimous-swarm', { votingStrategy: 'unanimous' });
      si.joinSwarm(swarm.id, 'a1');
      si.joinSwarm(swarm.id, 'a2');

      const p = si.proposeDecision(swarm.id, { description: 'test', proposedBy: 'a1' });
      si.vote(swarm.id, p.id, 'a1', 'approve');
      si.vote(swarm.id, p.id, 'a2', 'reject');

      const result = si.resolveProposal(swarm.id, p.id);
      expect(result.approved).toBe(false);
    });
  });

  describe('resolveProposal - quorum strategy', () => {
    it('should approve when quorum met and approves > rejects', () => {
      const swarm = si.createSwarm('quorum-swarm', {
        votingStrategy: 'quorum',
        consensusThreshold: 0.5,
      });
      si.joinSwarm(swarm.id, 'a1');
      si.joinSwarm(swarm.id, 'a2');
      si.joinSwarm(swarm.id, 'a3');
      si.joinSwarm(swarm.id, 'a4');

      const p = si.proposeDecision(swarm.id, { description: 'test', proposedBy: 'a1' });
      si.vote(swarm.id, p.id, 'a1', 'approve');
      si.vote(swarm.id, p.id, 'a2', 'approve');
      // a3, a4 don't vote — quorum = ceil(4 * 0.5) = 2 — met

      const result = si.resolveProposal(swarm.id, p.id);
      expect(result.approved).toBe(true);
      expect(result.hasQuorum).toBe(true);
    });

    it('should reject when quorum not met', () => {
      const swarm = si.createSwarm('quorum-swarm', {
        votingStrategy: 'quorum',
        consensusThreshold: 0.8,
      });
      si.joinSwarm(swarm.id, 'a1');
      si.joinSwarm(swarm.id, 'a2');
      si.joinSwarm(swarm.id, 'a3');
      si.joinSwarm(swarm.id, 'a4');
      si.joinSwarm(swarm.id, 'a5');

      const p = si.proposeDecision(swarm.id, { description: 'test', proposedBy: 'a1' });
      si.vote(swarm.id, p.id, 'a1', 'approve');
      si.vote(swarm.id, p.id, 'a2', 'approve');
      // quorum = ceil(5 * 0.8) = 4, only 2 voted

      const result = si.resolveProposal(swarm.id, p.id);
      expect(result.approved).toBe(false);
      expect(result.hasQuorum).toBe(false);
    });
  });

  describe('resolveProposal - common', () => {
    it('should emit proposal:resolved event', () => {
      const handler = jest.fn();
      si.on('proposal:resolved', handler);

      const swarm = si.createSwarm('resolved-swarm');
      si.joinSwarm(swarm.id, 'a1');
      const p = si.proposeDecision(swarm.id, { description: 't', proposedBy: 'a1' });
      si.vote(swarm.id, p.id, 'a1', 'approve');
      si.resolveProposal(swarm.id, p.id);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ swarmId: swarm.id, proposalId: p.id })
      );
    });

    it('should throw if resolving already-resolved proposal', () => {
      const swarm = si.createSwarm('resolved-swarm');
      si.joinSwarm(swarm.id, 'a1');
      const p = si.proposeDecision(swarm.id, { description: 't', proposedBy: 'a1' });
      si.vote(swarm.id, p.id, 'a1', 'approve');
      si.resolveProposal(swarm.id, p.id);

      expect(() => si.resolveProposal(swarm.id, p.id))
        .toThrow('already resolved');
    });

    it('should update reputations after resolution', () => {
      const swarm = si.createSwarm('rep-swarm');
      si.joinSwarm(swarm.id, 'a1');
      si.joinSwarm(swarm.id, 'a2');
      si.joinSwarm(swarm.id, 'a3');

      const p = si.proposeDecision(swarm.id, { description: 'test', proposedBy: 'a1' });
      si.vote(swarm.id, p.id, 'a1', 'approve');
      si.vote(swarm.id, p.id, 'a2', 'reject');
      si.vote(swarm.id, p.id, 'a3', 'approve');

      const initRepA1 = swarm.agents.get('a1').reputation;
      const initRepA2 = swarm.agents.get('a2').reputation;

      si.resolveProposal(swarm.id, p.id);

      // a1 voted approve (aligned with result = approved) => rep goes up
      expect(swarm.agents.get('a1').reputation).toBeGreaterThan(initRepA1);
      // a2 voted reject (not aligned) => rep goes down
      expect(swarm.agents.get('a2').reputation).toBeLessThan(initRepA2);
    });

    it('should not change reputation for abstain votes', () => {
      const swarm = si.createSwarm('abstain-rep');
      si.joinSwarm(swarm.id, 'a1');
      si.joinSwarm(swarm.id, 'a2');

      const p = si.proposeDecision(swarm.id, { description: 'test', proposedBy: 'a1' });
      si.vote(swarm.id, p.id, 'a1', 'approve');
      si.vote(swarm.id, p.id, 'a2', 'abstain');

      si.resolveProposal(swarm.id, p.id);

      expect(swarm.agents.get('a2').reputation).toBe(1.0); // unchanged
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          KNOWLEDGE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  describe('shareKnowledge', () => {
    let swarm;

    beforeEach(() => {
      swarm = si.createSwarm('knowledge-swarm');
      si.joinSwarm(swarm.id, 'agent-1');
    });

    it('should add knowledge to the swarm', () => {
      const entry = si.shareKnowledge(swarm.id, 'agent-1', {
        topic: 'deployment',
        content: 'Use blue-green deployments for zero downtime',
        tags: ['devops', 'deployment'],
      });
      expect(entry.id).toBeDefined();
      expect(entry.topic).toBe('deployment');
      expect(entry.sharedBy).toBe('agent-1');
      expect(entry.tags).toEqual(['devops', 'deployment']);
      expect(entry.citations).toBe(0);
      expect(swarm.knowledgeBase.length).toBe(1);
    });

    it('should emit knowledge:shared event', () => {
      const handler = jest.fn();
      si.on('knowledge:shared', handler);
      si.shareKnowledge(swarm.id, 'agent-1', {
        topic: 'test',
        content: 'some content',
      });
      expect(handler).toHaveBeenCalled();
    });

    it('should throw if agent is not a member', () => {
      expect(() => si.shareKnowledge(swarm.id, 'outsider', {
        topic: 'test',
        content: 'data',
      })).toThrow('not a member');
    });

    it('should throw if topic is missing', () => {
      expect(() => si.shareKnowledge(swarm.id, 'agent-1', {
        content: 'data',
      })).toThrow('topic is required');
    });

    it('should throw if content is null', () => {
      expect(() => si.shareKnowledge(swarm.id, 'agent-1', {
        topic: 'test',
        content: null,
      })).toThrow('content is required');
    });
  });

  describe('queryKnowledge', () => {
    let swarm;

    beforeEach(() => {
      swarm = si.createSwarm('knowledge-swarm');
      si.joinSwarm(swarm.id, 'agent-1');
      si.joinSwarm(swarm.id, 'agent-2');

      si.shareKnowledge(swarm.id, 'agent-1', {
        topic: 'deployment strategies',
        content: 'blue-green',
        tags: ['devops', 'ci-cd'],
      });
      si.shareKnowledge(swarm.id, 'agent-1', {
        topic: 'testing patterns',
        content: 'TDD is great',
        tags: ['testing', 'quality'],
      });
      si.shareKnowledge(swarm.id, 'agent-2', {
        topic: 'deployment monitoring',
        content: 'prometheus + grafana',
        tags: ['devops', 'monitoring'],
      });
    });

    it('should return all knowledge when no filter', () => {
      const results = si.queryKnowledge(swarm.id);
      expect(results.length).toBe(3);
    });

    it('should filter by topic substring', () => {
      const results = si.queryKnowledge(swarm.id, { topic: 'deployment' });
      expect(results.length).toBe(2);
    });

    it('should filter by tags', () => {
      const results = si.queryKnowledge(swarm.id, { tags: ['testing'] });
      expect(results.length).toBe(1);
      expect(results[0].topic).toBe('testing patterns');
    });

    it('should filter by sharedBy', () => {
      const results = si.queryKnowledge(swarm.id, { sharedBy: 'agent-2' });
      expect(results.length).toBe(1);
    });

    it('should respect limit', () => {
      const results = si.queryKnowledge(swarm.id, { limit: 1 });
      expect(results.length).toBe(1);
    });

    it('should increment citations on queried results', () => {
      si.queryKnowledge(swarm.id, { topic: 'deployment' });
      const k = swarm.knowledgeBase.find((k) => k.topic === 'deployment strategies');
      expect(k.citations).toBe(1);
    });

    it('should be case-insensitive for topic search', () => {
      const results = si.queryKnowledge(swarm.id, { topic: 'DEPLOYMENT' });
      expect(results.length).toBe(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          LEADER ELECTION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('electLeader', () => {
    let swarm;

    beforeEach(() => {
      swarm = si.createSwarm('leader-swarm');
      si.joinSwarm(swarm.id, 'generalist', ['coding']);
      si.joinSwarm(swarm.id, 'expert', ['coding', 'testing', 'devops', 'architecture']);
      si.joinSwarm(swarm.id, 'mid', ['coding', 'testing']);
    });

    it('should elect most-capable leader (most capabilities)', () => {
      const result = si.electLeader(swarm.id, 'most-capable');
      expect(result.leaderId).toBe('expert');
      expect(result.criterion).toBe('most-capable');
      expect(swarm.leader).toBe('expert');
    });

    it('should elect highest-reputation leader', () => {
      swarm.agents.get('generalist').reputation = 1.8;
      swarm.agents.get('expert').reputation = 1.2;
      swarm.agents.get('mid').reputation = 0.9;

      const result = si.electLeader(swarm.id, 'highest-reputation');
      expect(result.leaderId).toBe('generalist');
    });

    it('should rotate leader with round-robin', () => {
      const first = si.electLeader(swarm.id, 'round-robin');
      const second = si.electLeader(swarm.id, 'round-robin');
      const third = si.electLeader(swarm.id, 'round-robin');

      // Should cycle through the agents
      expect(first.leaderId).not.toBe(second.leaderId);
      expect(second.leaderId).not.toBe(third.leaderId);
    });

    it('should emit leader:elected event', () => {
      const handler = jest.fn();
      si.on('leader:elected', handler);
      si.electLeader(swarm.id);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ swarmId: swarm.id })
      );
    });

    it('should throw for empty swarm', () => {
      const empty = si.createSwarm('empty');
      expect(() => si.electLeader(empty.id))
        .toThrow('no agents');
    });

    it('should throw for invalid criterion', () => {
      expect(() => si.electLeader(swarm.id, 'random'))
        .toThrow('Invalid criterion');
    });

    it('should increment leadersElected stat', () => {
      si.electLeader(swarm.id);
      expect(si.getStats().leadersElected).toBe(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          HEALTH & STATS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getSwarmHealth', () => {
    it('should return health metrics for active swarm', () => {
      const swarm = si.createSwarm('health-test', { minAgents: 2 });
      si.joinSwarm(swarm.id, 'a1', ['coding']);
      si.joinSwarm(swarm.id, 'a2', ['testing']);

      const health = si.getSwarmHealth(swarm.id);
      expect(health.status).toBe(SWARM_STATUS.ACTIVE);
      expect(health.agentCount).toBe(2);
      expect(health.meetsMinAgents).toBe(true);
      expect(health.healthScore).toBeGreaterThan(0);
      expect(health.avgReputation).toBe(1.0);
    });

    it('should report dissolved swarm health with score 0', () => {
      const swarm = si.createSwarm('temp');
      si.dissolveSwarm(swarm.id);

      const health = si.getSwarmHealth(swarm.id);
      expect(health.status).toBe(SWARM_STATUS.DISSOLVED);
      expect(health.healthScore).toBe(0);
    });

    it('should reflect leader presence in health', () => {
      const swarm = si.createSwarm('leader-health');
      si.joinSwarm(swarm.id, 'a1');

      const noLeader = si.getSwarmHealth(swarm.id);
      si.electLeader(swarm.id);
      const withLeader = si.getSwarmHealth(swarm.id);

      expect(withLeader.healthScore).toBeGreaterThan(noLeader.healthScore);
      expect(withLeader.hasLeader).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return global statistics', () => {
      const stats = si.getStats();
      expect(stats).toHaveProperty('swarmsCreated');
      expect(stats).toHaveProperty('swarmsDissolved');
      expect(stats).toHaveProperty('proposalsCreated');
      expect(stats).toHaveProperty('proposalsResolved');
      expect(stats).toHaveProperty('knowledgeShared');
      expect(stats).toHaveProperty('leadersElected');
      expect(stats).toHaveProperty('totalVotes');
      expect(stats).toHaveProperty('activeSwarms');
      expect(stats).toHaveProperty('totalSwarms');
      expect(stats).toHaveProperty('totalAgents');
    });

    it('should track stats across multiple swarms', () => {
      const s1 = si.createSwarm('s1');
      const s2 = si.createSwarm('s2');
      si.joinSwarm(s1.id, 'a1');
      si.joinSwarm(s2.id, 'a2');
      si.joinSwarm(s2.id, 'a3');

      const stats = si.getStats();
      expect(stats.swarmsCreated).toBe(2);
      expect(stats.activeSwarms).toBe(2);
      expect(stats.totalAgents).toBe(3);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('persistence', () => {
    it('should save and load state from disk', async () => {
      const persisted = new SwarmIntelligence(TEST_PROJECT_ROOT, { persist: true, debug: false });
      const swarm = persisted.createSwarm('persistent-swarm');
      persisted.joinSwarm(swarm.id, 'agent-1', ['coding']);
      persisted.shareKnowledge(swarm.id, 'agent-1', {
        topic: 'persistence',
        content: 'works!',
      });

      // Wait for async persistence
      await persisted._saveToDisk();

      // Load into fresh instance
      const loaded = new SwarmIntelligence(TEST_PROJECT_ROOT, { persist: true, debug: false });
      const success = await loaded.loadFromDisk();
      expect(success).toBe(true);

      const loadedSwarm = loaded.swarms.get(swarm.id);
      expect(loadedSwarm).toBeDefined();
      expect(loadedSwarm.name).toBe('persistent-swarm');
      expect(loadedSwarm.agents.get('agent-1')).toBeDefined();
      expect(loadedSwarm.knowledgeBase.length).toBe(1);
    });

    it('should return false when no persisted file exists', async () => {
      const fresh = new SwarmIntelligence(path.join(TEST_PROJECT_ROOT, 'nonexistent'), {
        persist: true,
        debug: false,
      });
      const result = await fresh.loadFromDisk();
      expect(result).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          EXPORTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('exports', () => {
    it('should export SwarmIntelligence as default and named', () => {
      const mod = require('../../../.aiox-core/core/orchestration/swarm-intelligence');
      expect(mod).toBe(SwarmIntelligence);
      expect(mod.SwarmIntelligence).toBe(SwarmIntelligence);
    });

    it('should export constants', () => {
      expect(VOTING_STRATEGIES).toBeDefined();
      expect(PROPOSAL_STATUS).toBeDefined();
      expect(SWARM_STATUS).toBeDefined();
      expect(LEADER_CRITERIA).toBeDefined();
      expect(VOTE_OPTIONS).toBeDefined();
    });
  });
});
