/**
 * Agent Swarm Intelligence
 * Story ORCH-5 - Emergent intelligence from multi-agent collaboration
 * @module aiox-core/orchestration/swarm-intelligence
 * @version 1.0.0
 */

'use strict';

const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════
//                              CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const PERSISTENCE_DIR = '.aiox';
const PERSISTENCE_FILE = 'swarms.json';

const VOTING_STRATEGIES = {
  MAJORITY: 'majority',
  WEIGHTED: 'weighted',
  UNANIMOUS: 'unanimous',
  QUORUM: 'quorum',
};

const PROPOSAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
};

const SWARM_STATUS = {
  ACTIVE: 'active',
  DISSOLVED: 'dissolved',
};

const LEADER_CRITERIA = {
  MOST_CAPABLE: 'most-capable',
  HIGHEST_REPUTATION: 'highest-reputation',
  ROUND_ROBIN: 'round-robin',
};

const VOTE_OPTIONS = {
  APPROVE: 'approve',
  REJECT: 'reject',
  ABSTAIN: 'abstain',
};

// ═══════════════════════════════════════════════════════════════════════════════
//                              HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a unique identifier
 * @returns {string} UUID-like identifier
 */
function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Validate confidence value is between 0 and 1
 * @param {number} confidence
 * @returns {boolean}
 */
function isValidConfidence(confidence) {
  return typeof confidence === 'number' && confidence >= 0 && confidence <= 1;
}

// ═══════════════════════════════════════════════════════════════════════════════
//                          SWARM INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SwarmIntelligence - Emergent intelligence from multi-agent collaboration
 *
 * Provides swarm creation, agent coordination, collective decision-making
 * via voting strategies, shared knowledge management, and leader election.
 *
 * @extends EventEmitter
 */
class SwarmIntelligence extends EventEmitter {
  /**
   * Creates a new SwarmIntelligence instance
   * @param {string} projectRoot - Project root directory for persistence
   * @param {Object} [options] - Configuration options
   * @param {boolean} [options.debug=false] - Enable debug logging
   * @param {boolean} [options.persist=true] - Enable persistence to disk
   */
  constructor(projectRoot, options = {}) {
    super();

    if (!projectRoot || typeof projectRoot !== 'string') {
      throw new Error('projectRoot is required and must be a string');
    }

    this.projectRoot = projectRoot;
    this.options = {
      debug: options.debug ?? false,
      persist: options.persist ?? true,
    };

    /** @type {Map<string, Object>} Active swarms indexed by ID */
    this.swarms = new Map();

    /** @type {Object} Global statistics */
    this._stats = {
      swarmsCreated: 0,
      swarmsDissolved: 0,
      proposalsCreated: 0,
      proposalsResolved: 0,
      knowledgeShared: 0,
      leadersElected: 0,
      totalVotes: 0,
    };

    /** @type {number} Round-robin index tracking per swarm */
    this._roundRobinIndex = new Map();

    this._persistPath = path.join(projectRoot, PERSISTENCE_DIR, PERSISTENCE_FILE);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //                          SWARM MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create a named swarm with configuration
   * @param {string} name - Swarm name
   * @param {Object} [config] - Swarm configuration
   * @param {number} [config.minAgents=2] - Minimum agents required
   * @param {number} [config.maxAgents=50] - Maximum agents allowed
   * @param {number} [config.consensusThreshold=0.6] - Consensus threshold (0-1)
   * @param {string} [config.votingStrategy='majority'] - Voting strategy
   * @returns {Object} Created swarm
   */
  createSwarm(name, config = {}) {
    if (!name || typeof name !== 'string') {
      throw new Error('Swarm name is required and must be a string');
    }

    const votingStrategy = config.votingStrategy ?? VOTING_STRATEGIES.MAJORITY;
    if (!Object.values(VOTING_STRATEGIES).includes(votingStrategy)) {
      throw new Error(`Invalid voting strategy: ${votingStrategy}. Must be one of: ${Object.values(VOTING_STRATEGIES).join(', ')}`);
    }

    const consensusThreshold = config.consensusThreshold ?? 0.6;
    if (typeof consensusThreshold !== 'number' || consensusThreshold < 0 || consensusThreshold > 1) {
      throw new Error('consensusThreshold must be a number between 0 and 1');
    }

    const minAgents = config.minAgents ?? 2;
    const maxAgents = config.maxAgents ?? 50;

    if (minAgents < 1) {
      throw new Error('minAgents must be at least 1');
    }
    if (maxAgents < minAgents) {
      throw new Error('maxAgents must be >= minAgents');
    }

    const id = generateId();
    const swarm = {
      id,
      name,
      agents: new Map(),
      proposals: [],
      knowledgeBase: [],
      leader: null,
      config: {
        minAgents,
        maxAgents,
        consensusThreshold,
        votingStrategy,
      },
      createdAt: new Date().toISOString(),
      status: SWARM_STATUS.ACTIVE,
    };

    this.swarms.set(id, swarm);
    this._stats.swarmsCreated++;
    this._roundRobinIndex.set(id, 0);

    this.emit('swarm:created', { swarmId: id, name, config: swarm.config });
    this._log(`Swarm created: ${name} (${id})`);
    this._persistAsync();

    return swarm;
  }

  /**
   * Agent joins a swarm with declared capabilities
   * @param {string} swarmId - Swarm identifier
   * @param {string} agentId - Agent identifier
   * @param {string[]} [capabilities=[]] - Agent capabilities
   * @returns {Object} Updated swarm
   */
  joinSwarm(swarmId, agentId, capabilities = []) {
    const swarm = this._getActiveSwarm(swarmId);

    if (!agentId || typeof agentId !== 'string') {
      throw new Error('agentId is required and must be a string');
    }

    if (swarm.agents.has(agentId)) {
      throw new Error(`Agent ${agentId} is already a member of swarm ${swarmId}`);
    }

    if (swarm.agents.size >= swarm.config.maxAgents) {
      throw new Error(`Swarm ${swarmId} has reached maximum capacity (${swarm.config.maxAgents})`);
    }

    const agent = {
      id: agentId,
      capabilities: Array.isArray(capabilities) ? [...capabilities] : [],
      joinedAt: new Date().toISOString(),
      reputation: 1.0,
      votesCount: 0,
    };

    swarm.agents.set(agentId, agent);

    this.emit('swarm:joined', { swarmId, agentId, capabilities: agent.capabilities });
    this._log(`Agent ${agentId} joined swarm ${swarmId}`);
    this._persistAsync();

    return swarm;
  }

  /**
   * Agent leaves a swarm
   * @param {string} swarmId - Swarm identifier
   * @param {string} agentId - Agent identifier
   * @returns {Object} Updated swarm
   */
  leaveSwarm(swarmId, agentId) {
    const swarm = this._getActiveSwarm(swarmId);

    if (!swarm.agents.has(agentId)) {
      throw new Error(`Agent ${agentId} is not a member of swarm ${swarmId}`);
    }

    swarm.agents.delete(agentId);

    // If the leader left, clear leadership
    if (swarm.leader === agentId) {
      swarm.leader = null;
    }

    this.emit('swarm:left', { swarmId, agentId });
    this._log(`Agent ${agentId} left swarm ${swarmId}`);
    this._persistAsync();

    return swarm;
  }

  /**
   * Dissolve a swarm
   * @param {string} swarmId - Swarm identifier
   * @returns {Object} Dissolved swarm summary
   */
  dissolveSwarm(swarmId) {
    const swarm = this._getActiveSwarm(swarmId);

    swarm.status = SWARM_STATUS.DISSOLVED;
    swarm.dissolvedAt = new Date().toISOString();
    this._stats.swarmsDissolved++;

    const summary = {
      id: swarm.id,
      name: swarm.name,
      agentCount: swarm.agents.size,
      proposalCount: swarm.proposals.length,
      knowledgeCount: swarm.knowledgeBase.length,
      dissolvedAt: swarm.dissolvedAt,
    };

    this.emit('swarm:dissolved', { swarmId, summary });
    this._log(`Swarm dissolved: ${swarm.name} (${swarmId})`);
    this._persistAsync();

    return summary;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //                          DECISION MAKING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Submit a proposal for collective voting
   * @param {string} swarmId - Swarm identifier
   * @param {Object} proposal - Proposal details
   * @param {string} proposal.description - Proposal description
   * @param {string} proposal.proposedBy - Agent ID proposing
   * @param {string} [proposal.type='general'] - Proposal type
   * @param {number} [proposal.deadlineMs=300000] - Deadline in milliseconds (default 5 min)
   * @returns {Object} Created proposal
   */
  proposeDecision(swarmId, proposal) {
    const swarm = this._getActiveSwarm(swarmId);

    if (!proposal || typeof proposal !== 'object') {
      throw new Error('proposal is required and must be an object');
    }
    if (!proposal.description || typeof proposal.description !== 'string') {
      throw new Error('proposal.description is required');
    }
    if (!proposal.proposedBy || typeof proposal.proposedBy !== 'string') {
      throw new Error('proposal.proposedBy is required');
    }
    if (!swarm.agents.has(proposal.proposedBy)) {
      throw new Error(`Agent ${proposal.proposedBy} is not a member of swarm ${swarmId}`);
    }

    const id = generateId();
    const deadlineMs = proposal.deadlineMs ?? 300000;
    const created = {
      id,
      swarmId,
      proposedBy: proposal.proposedBy,
      description: proposal.description,
      type: proposal.type ?? 'general',
      votes: new Map(),
      status: PROPOSAL_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + deadlineMs).toISOString(),
    };

    swarm.proposals.push(created);
    this._stats.proposalsCreated++;

    this.emit('proposal:created', { swarmId, proposalId: id, proposedBy: proposal.proposedBy });
    this._log(`Proposal created in swarm ${swarmId}: ${proposal.description}`);
    this._persistAsync();

    return created;
  }

  /**
   * Cast a vote on a proposal
   * @param {string} swarmId - Swarm identifier
   * @param {string} proposalId - Proposal identifier
   * @param {string} agentId - Voting agent ID
   * @param {string} voteValue - Vote: 'approve', 'reject', or 'abstain'
   * @param {number} [confidence=1.0] - Confidence level (0-1)
   * @returns {Object} Updated proposal
   */
  vote(swarmId, proposalId, agentId, voteValue, confidence = 1.0) {
    const swarm = this._getActiveSwarm(swarmId);
    const proposal = this._getPendingProposal(swarm, proposalId);

    if (!swarm.agents.has(agentId)) {
      throw new Error(`Agent ${agentId} is not a member of swarm ${swarmId}`);
    }

    if (!Object.values(VOTE_OPTIONS).includes(voteValue)) {
      throw new Error(`Invalid vote: ${voteValue}. Must be one of: ${Object.values(VOTE_OPTIONS).join(', ')}`);
    }

    if (!isValidConfidence(confidence)) {
      throw new Error('confidence must be a number between 0 and 1');
    }

    if (proposal.votes.has(agentId)) {
      throw new Error(`Agent ${agentId} has already voted on proposal ${proposalId}`);
    }

    // Check deadline
    if (new Date(proposal.deadline) < new Date()) {
      proposal.status = PROPOSAL_STATUS.EXPIRED;
      throw new Error(`Proposal ${proposalId} has expired`);
    }

    proposal.votes.set(agentId, {
      agentId,
      vote: voteValue,
      confidence,
      timestamp: new Date().toISOString(),
    });

    // Update agent stats
    const agent = swarm.agents.get(agentId);
    agent.votesCount++;
    this._stats.totalVotes++;

    this.emit('proposal:voted', { swarmId, proposalId, agentId, vote: voteValue, confidence });
    this._log(`Agent ${agentId} voted '${voteValue}' on proposal ${proposalId} (confidence: ${confidence})`);
    this._persistAsync();

    return proposal;
  }

  /**
   * Resolve a proposal based on votes and configured strategy
   * @param {string} swarmId - Swarm identifier
   * @param {string} proposalId - Proposal identifier
   * @returns {Object} Resolution result
   */
  resolveProposal(swarmId, proposalId) {
    const swarm = this._getActiveSwarm(swarmId);
    const proposal = this._getProposal(swarm, proposalId);

    if (proposal.status !== PROPOSAL_STATUS.PENDING) {
      throw new Error(`Proposal ${proposalId} is already resolved (status: ${proposal.status})`);
    }

    // Reject expired proposals before applying voting strategy
    if (new Date(proposal.deadline) < new Date()) {
      proposal.status = PROPOSAL_STATUS.REJECTED;
      proposal.resolvedAt = new Date().toISOString();
      proposal.resolution = { approved: false, reason: 'deadline_expired' };
      this._stats.proposalsResolved++;

      this.emit('proposal:resolved', {
        swarmId,
        proposalId,
        status: proposal.status,
        result: proposal.resolution,
      });
      this._log(`Proposal ${proposalId} rejected: deadline expired`);
      this._persistAsync();

      return {
        proposalId,
        status: proposal.status,
        ...proposal.resolution,
      };
    }

    const result = this._applyVotingStrategy(swarm, proposal);

    proposal.status = result.approved ? PROPOSAL_STATUS.APPROVED : PROPOSAL_STATUS.REJECTED;
    proposal.resolvedAt = new Date().toISOString();
    proposal.resolution = result;
    this._stats.proposalsResolved++;

    // Update reputation based on alignment with result
    this._updateReputations(swarm, proposal, result.approved);

    this.emit('proposal:resolved', {
      swarmId,
      proposalId,
      status: proposal.status,
      result,
    });
    this._log(`Proposal ${proposalId} resolved: ${proposal.status}`);
    this._persistAsync();

    return {
      proposalId,
      status: proposal.status,
      ...result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //                          VOTING STRATEGIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Apply the configured voting strategy to determine outcome
   * @param {Object} swarm - Swarm object
   * @param {Object} proposal - Proposal object
   * @returns {Object} Strategy result { approved, approveCount, rejectCount, abstainCount, details }
   * @private
   */
  _applyVotingStrategy(swarm, proposal) {
    const votes = Array.from(proposal.votes.values());
    const approveVotes = votes.filter((v) => v.vote === VOTE_OPTIONS.APPROVE);
    const rejectVotes = votes.filter((v) => v.vote === VOTE_OPTIONS.REJECT);
    const abstainVotes = votes.filter((v) => v.vote === VOTE_OPTIONS.ABSTAIN);

    const base = {
      approveCount: approveVotes.length,
      rejectCount: rejectVotes.length,
      abstainCount: abstainVotes.length,
      totalVotes: votes.length,
      totalAgents: swarm.agents.size,
    };

    switch (swarm.config.votingStrategy) {
      case VOTING_STRATEGIES.MAJORITY:
        return this._majorityStrategy(base);

      case VOTING_STRATEGIES.WEIGHTED:
        return this._weightedStrategy(swarm, approveVotes, rejectVotes, base);

      case VOTING_STRATEGIES.UNANIMOUS:
        return this._unanimousStrategy(base);

      case VOTING_STRATEGIES.QUORUM:
        return this._quorumStrategy(swarm, base);

      default:
        return this._majorityStrategy(base);
    }
  }

  /**
   * Majority: simple majority of non-abstain votes
   * @private
   */
  _majorityStrategy(base) {
    const nonAbstain = base.approveCount + base.rejectCount;
    const approved = nonAbstain > 0 && base.approveCount > nonAbstain / 2;
    return { ...base, approved, strategy: VOTING_STRATEGIES.MAJORITY };
  }

  /**
   * Weighted: votes weighted by agent reputation and confidence
   * @private
   */
  _weightedStrategy(swarm, approveVotes, rejectVotes, base) {
    let approveWeight = 0;
    let rejectWeight = 0;

    for (const v of approveVotes) {
      const agent = swarm.agents.get(v.agentId);
      const reputation = agent ? agent.reputation : 1.0;
      approveWeight += v.confidence * reputation;
    }

    for (const v of rejectVotes) {
      const agent = swarm.agents.get(v.agentId);
      const reputation = agent ? agent.reputation : 1.0;
      rejectWeight += v.confidence * reputation;
    }

    const totalWeight = approveWeight + rejectWeight;
    const approved = totalWeight > 0 && approveWeight > totalWeight / 2;

    return {
      ...base,
      approved,
      approveWeight: Math.round(approveWeight * 100) / 100,
      rejectWeight: Math.round(rejectWeight * 100) / 100,
      strategy: VOTING_STRATEGIES.WEIGHTED,
    };
  }

  /**
   * Unanimous: all non-abstain votes must approve
   * @private
   */
  _unanimousStrategy(base) {
    const nonAbstain = base.approveCount + base.rejectCount;
    const approved = nonAbstain > 0 && base.rejectCount === 0;
    return { ...base, approved, strategy: VOTING_STRATEGIES.UNANIMOUS };
  }

  /**
   * Quorum: requires consensusThreshold proportion of total agents to approve
   * @private
   */
  _quorumStrategy(swarm, base) {
    const quorumRequired = Math.ceil(swarm.agents.size * swarm.config.consensusThreshold);
    // Abstains and rejects don't count toward quorum
    const hasQuorum = base.approveCount >= quorumRequired;
    const approved = hasQuorum && base.approveCount > base.rejectCount;

    return {
      ...base,
      approved,
      quorumRequired,
      hasQuorum,
      strategy: VOTING_STRATEGIES.QUORUM,
    };
  }

  /**
   * Update agent reputations based on vote alignment with the final result
   * Agents who voted with the majority gain reputation, others lose slightly
   * @param {Object} swarm - Swarm object
   * @param {Object} proposal - Resolved proposal
   * @param {boolean} approved - Whether the proposal was approved
   * @private
   */
  _updateReputations(swarm, proposal, approved) {
    for (const [agentId, voteData] of proposal.votes) {
      const agent = swarm.agents.get(agentId);
      if (!agent) continue;

      const alignedWithResult =
        (approved && voteData.vote === VOTE_OPTIONS.APPROVE) ||
        (!approved && voteData.vote === VOTE_OPTIONS.REJECT);

      if (voteData.vote === VOTE_OPTIONS.ABSTAIN) {
        // Abstaining has no reputation effect
        continue;
      }

      if (alignedWithResult) {
        agent.reputation = Math.min(2.0, agent.reputation + 0.05);
      } else {
        agent.reputation = Math.max(0.1, agent.reputation - 0.03);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //                          KNOWLEDGE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Share a knowledge artifact with the swarm
   * @param {string} swarmId - Swarm identifier
   * @param {string} agentId - Sharing agent ID
   * @param {Object} knowledge - Knowledge artifact
   * @param {string} knowledge.topic - Knowledge topic
   * @param {*} knowledge.content - Knowledge content
   * @param {string[]} [knowledge.tags=[]] - Searchable tags
   * @returns {Object} Created knowledge entry
   */
  shareKnowledge(swarmId, agentId, knowledge) {
    const swarm = this._getActiveSwarm(swarmId);

    if (!swarm.agents.has(agentId)) {
      throw new Error(`Agent ${agentId} is not a member of swarm ${swarmId}`);
    }

    if (!knowledge || typeof knowledge !== 'object') {
      throw new Error('knowledge is required and must be an object');
    }
    if (!knowledge.topic || typeof knowledge.topic !== 'string') {
      throw new Error('knowledge.topic is required');
    }
    if (knowledge.content === undefined || knowledge.content === null) {
      throw new Error('knowledge.content is required');
    }

    const id = generateId();
    const entry = {
      id,
      sharedBy: agentId,
      topic: knowledge.topic,
      content: knowledge.content,
      tags: Array.isArray(knowledge.tags) ? [...knowledge.tags] : [],
      timestamp: new Date().toISOString(),
      citations: 0,
    };

    swarm.knowledgeBase.push(entry);
    this._stats.knowledgeShared++;

    this.emit('knowledge:shared', { swarmId, agentId, knowledgeId: id, topic: knowledge.topic });
    this._log(`Knowledge shared in swarm ${swarmId}: ${knowledge.topic}`);
    this._persistAsync();

    return entry;
  }

  /**
   * Query the collective knowledge base of a swarm
   * @param {string} swarmId - Swarm identifier
   * @param {Object} query - Query parameters
   * @param {string} [query.topic] - Filter by topic (substring match)
   * @param {string[]} [query.tags] - Filter by tags (any match)
   * @param {string} [query.sharedBy] - Filter by agent
   * @param {number} [query.limit=10] - Max results
   * @returns {Object[]} Matching knowledge entries
   */
  queryKnowledge(swarmId, query = {}) {
    const swarm = this._getActiveSwarm(swarmId);
    let results = [...swarm.knowledgeBase];

    if (query.topic) {
      const topicLower = query.topic.toLowerCase();
      results = results.filter((k) => k.topic.toLowerCase().includes(topicLower));
    }

    if (query.tags && Array.isArray(query.tags) && query.tags.length > 0) {
      const queryTags = query.tags.map((t) => t.toLowerCase());
      results = results.filter((k) =>
        k.tags.some((tag) => queryTags.includes(tag.toLowerCase()))
      );
    }

    if (query.sharedBy) {
      results = results.filter((k) => k.sharedBy === query.sharedBy);
    }

    const limit = query.limit ?? 10;

    // Increment citation count for returned results
    const limited = results.slice(0, limit);
    for (const entry of limited) {
      const original = swarm.knowledgeBase.find((k) => k.id === entry.id);
      if (original) {
        original.citations++;
      }
    }

    // Persist citation bumps
    this._persistAsync();

    return limited;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //                          LEADER ELECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Elect a leader for the swarm based on criterion
   * @param {string} swarmId - Swarm identifier
   * @param {string} [criterion='most-capable'] - Election criterion
   * @returns {Object} Election result { leaderId, criterion, agentDetails }
   */
  electLeader(swarmId, criterion = LEADER_CRITERIA.MOST_CAPABLE) {
    const swarm = this._getActiveSwarm(swarmId);

    if (swarm.agents.size === 0) {
      throw new Error(`Swarm ${swarmId} has no agents to elect a leader from`);
    }

    const validCriteria = Object.values(LEADER_CRITERIA);
    if (!validCriteria.includes(criterion)) {
      throw new Error(`Invalid criterion: ${criterion}. Must be one of: ${validCriteria.join(', ')}`);
    }

    let leaderId;
    const agents = Array.from(swarm.agents.entries());

    switch (criterion) {
      case LEADER_CRITERIA.MOST_CAPABLE: {
        // Agent with most capabilities wins
        let maxCapabilities = -1;
        for (const [id, agent] of agents) {
          if (agent.capabilities.length > maxCapabilities) {
            maxCapabilities = agent.capabilities.length;
            leaderId = id;
          }
        }
        break;
      }

      case LEADER_CRITERIA.HIGHEST_REPUTATION: {
        // Agent with highest reputation wins
        let maxReputation = -1;
        for (const [id, agent] of agents) {
          if (agent.reputation > maxReputation) {
            maxReputation = agent.reputation;
            leaderId = id;
          }
        }
        break;
      }

      case LEADER_CRITERIA.ROUND_ROBIN: {
        // Rotate through agents in insertion order
        const agentIds = Array.from(swarm.agents.keys());
        const currentIndex = this._roundRobinIndex.get(swarmId) ?? 0;
        leaderId = agentIds[currentIndex % agentIds.length];
        this._roundRobinIndex.set(swarmId, (currentIndex + 1) % agentIds.length);
        break;
      }
    }

    swarm.leader = leaderId;
    this._stats.leadersElected++;

    const leaderAgent = swarm.agents.get(leaderId);
    const result = {
      leaderId,
      criterion,
      agentDetails: { ...leaderAgent },
    };

    this.emit('leader:elected', { swarmId, leaderId, criterion });
    this._log(`Leader elected in swarm ${swarmId}: ${leaderId} (criterion: ${criterion})`);
    this._persistAsync();

    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //                          HEALTH & STATS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get health metrics for a swarm
   * @param {string} swarmId - Swarm identifier
   * @returns {Object} Health metrics
   */
  getSwarmHealth(swarmId) {
    const swarm = this._getSwarm(swarmId);

    const agentCount = swarm.agents.size;
    const pendingProposals = swarm.proposals.filter((p) => p.status === PROPOSAL_STATUS.PENDING).length;
    const resolvedProposals = swarm.proposals.filter(
      (p) => p.status === PROPOSAL_STATUS.APPROVED || p.status === PROPOSAL_STATUS.REJECTED
    ).length;

    const agents = Array.from(swarm.agents.values());
    const avgReputation = agents.length > 0
      ? Math.round((agents.reduce((sum, a) => sum + a.reputation, 0) / agents.length) * 100) / 100
      : 0;

    const hasLeader = swarm.leader !== null;
    const meetsMinAgents = agentCount >= swarm.config.minAgents;

    // Health score: 0-100
    let healthScore = 0;
    if (swarm.status === SWARM_STATUS.ACTIVE) {
      healthScore += 30; // Base for being active
      if (meetsMinAgents) healthScore += 25;
      if (hasLeader) healthScore += 15;
      if (avgReputation >= 1.0) healthScore += 15;
      if (resolvedProposals > 0) healthScore += 15;
    }

    return {
      swarmId: swarm.id,
      name: swarm.name,
      status: swarm.status,
      agentCount,
      minAgents: swarm.config.minAgents,
      maxAgents: swarm.config.maxAgents,
      meetsMinAgents,
      hasLeader,
      leader: swarm.leader,
      pendingProposals,
      resolvedProposals,
      knowledgeEntries: swarm.knowledgeBase.length,
      avgReputation,
      healthScore,
      createdAt: swarm.createdAt,
    };
  }

  /**
   * Get global statistics across all swarms
   * @returns {Object} Global stats
   */
  getStats() {
    const activeSwarms = Array.from(this.swarms.values()).filter(
      (s) => s.status === SWARM_STATUS.ACTIVE
    ).length;

    const totalAgents = Array.from(this.swarms.values()).reduce(
      (sum, s) => sum + s.agents.size, 0
    );

    return {
      ...this._stats,
      activeSwarms,
      totalSwarms: this.swarms.size,
      totalAgents,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //                          PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Persist state to disk asynchronously (fire-and-forget)
   * @private
   */
  _persistAsync() {
    if (!this.options.persist) return;

    // Serialize writes to prevent concurrent fs operations
    this._pendingSave = (this._pendingSave || Promise.resolve())
      .then(() => this._saveToDisk())
      .catch((err) => {
        this._log(`Persistence error: ${err.message}`);
      });
  }

  /**
   * Save current state to disk
   * @returns {Promise<void>}
   * @private
   */
  async _saveToDisk() {
    const dir = path.dirname(this._persistPath);
    await fs.mkdir(dir, { recursive: true });

    const data = {
      version: '1.0.0',
      savedAt: new Date().toISOString(),
      stats: this._stats,
      swarms: this._serializeSwarms(),
    };

    await fs.writeFile(this._persistPath, JSON.stringify(data, null, 2), 'utf8');
  }

  /**
   * Load state from disk
   * @returns {Promise<boolean>} Whether state was loaded
   */
  async loadFromDisk() {
    try {
      const raw = await fs.readFile(this._persistPath, 'utf8');
      const data = JSON.parse(raw);

      if (data.stats) {
        this._stats = { ...this._stats, ...data.stats };
      }

      if (data.swarms && Array.isArray(data.swarms)) {
        for (const s of data.swarms) {
          const swarm = {
            ...s,
            agents: new Map(Object.entries(s.agents ?? {})),
            proposals: (s.proposals ?? []).map((p) => ({
              ...p,
              votes: new Map(Object.entries(p.votes ?? {})),
            })),
            knowledgeBase: s.knowledgeBase ?? [],
          };
          this.swarms.set(swarm.id, swarm);
        }
      }

      this._log('State loaded from disk');
      return true;
    } catch (err) {
      // Only treat ENOENT (file not found) as fresh start
      if (err.code === 'ENOENT') {
        return false;
      }
      this._log(`Failed to load state: ${err.message}`);
      throw err;
    }
  }

  /**
   * Serialize swarms for JSON persistence (Maps to plain objects)
   * @returns {Object[]}
   * @private
   */
  _serializeSwarms() {
    const result = [];
    for (const [, swarm] of this.swarms) {
      result.push({
        ...swarm,
        agents: Object.fromEntries(swarm.agents),
        proposals: swarm.proposals.map((p) => ({
          ...p,
          votes: Object.fromEntries(p.votes),
        })),
      });
    }
    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //                          INTERNAL HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get a swarm by ID (any status)
   * @param {string} swarmId
   * @returns {Object}
   * @private
   */
  _getSwarm(swarmId) {
    const swarm = this.swarms.get(swarmId);
    if (!swarm) {
      throw new Error(`Swarm not found: ${swarmId}`);
    }
    return swarm;
  }

  /**
   * Get an active swarm by ID
   * @param {string} swarmId
   * @returns {Object}
   * @private
   */
  _getActiveSwarm(swarmId) {
    const swarm = this._getSwarm(swarmId);
    if (swarm.status !== SWARM_STATUS.ACTIVE) {
      throw new Error(`Swarm ${swarmId} is not active (status: ${swarm.status})`);
    }
    return swarm;
  }

  /**
   * Get a proposal from a swarm
   * @param {Object} swarm
   * @param {string} proposalId
   * @returns {Object}
   * @private
   */
  _getProposal(swarm, proposalId) {
    const proposal = swarm.proposals.find((p) => p.id === proposalId);
    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }
    return proposal;
  }

  /**
   * Get a pending proposal from a swarm
   * @param {Object} swarm
   * @param {string} proposalId
   * @returns {Object}
   * @private
   */
  _getPendingProposal(swarm, proposalId) {
    const proposal = this._getProposal(swarm, proposalId);
    if (proposal.status !== PROPOSAL_STATUS.PENDING) {
      throw new Error(`Proposal ${proposalId} is not pending (status: ${proposal.status})`);
    }
    return proposal;
  }

  /**
   * Debug logging
   * @param {string} message
   * @private
   */
  _log(message) {
    if (this.options.debug) {
      console.log(`[SwarmIntelligence] ${message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = SwarmIntelligence;
module.exports.SwarmIntelligence = SwarmIntelligence;
module.exports.VOTING_STRATEGIES = VOTING_STRATEGIES;
module.exports.PROPOSAL_STATUS = PROPOSAL_STATUS;
module.exports.SWARM_STATUS = SWARM_STATUS;
module.exports.LEADER_CRITERIA = LEADER_CRITERIA;
module.exports.VOTE_OPTIONS = VOTE_OPTIONS;
