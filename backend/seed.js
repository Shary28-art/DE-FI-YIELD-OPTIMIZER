const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Protocol = require('./models/Protocol');
const User = require('./models/User');
const Investment = require('./models/Investment');
const Transaction = require('./models/Transaction');
const { isInMemoryFallback, inMemoryDB } = require('./config/db');

const SEED_PROTOCOLS = [
  {
    name: 'Aave v3',
    slug: 'aave',
    symbol: 'AAVE',
    logo: 'https://cryptologos.cc/logos/aave-aave-logo.svg?v=035',
    category: 'Lending',
    chains: ['Ethereum', 'Arbitrum', 'Polygon', 'Optimism', 'Avalanche', 'Base'],
    currentApy: 5.85,
    tvl: 12450000000,
    liquidityStatus: 'Deep',
    utilizationRate: 68,
    auditStatus: 'Multi-Audited',
    auditCount: 6,
    securityScore: 96,
    riskScore: 92,
    riskLevel: 'Low',
    protocolAgeYears: 5.2,
    launchDate: '2020-01-08',
    description: 'Decentralized non-custodial liquidity market protocol where users can participate as depositors or borrowers.',
    website: 'https://aave.com',
    github: 'https://github.com/aave/aave-v3-core',
    docsUrl: 'https://docs.aave.com',
    tokenContract: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    governanceModel: 'On-chain Aave DAO with Guardian veto and cross-chain governance timelock.',
    smartContractDetails: {
      upgradeability: 'Timelocked Proxy (48h+)',
      timelockHours: 72,
      multiSigRequirement: '10 of 14 Aave Guardian Signers',
      adminControlRisk: 'Low (Decentralized Timelock)',
      centralizationRisk: 'Decentralized',
      openVulnerabilities: 0,
      insuranceFundCovered: true,
      insuranceFundUsd: 185000000,
      bugBountyMax: 2000000,
      securityIncidents: [
        {
          date: '2023-11-04',
          description: 'Aave v3 isolation mode feature pause following security researcher disclosure.',
          fundsRecovered: true,
          amountLost: 0,
          resolution: 'Patched without user loss through standard governance proposal.',
        },
      ],
    },
    riskFactorBreakdown: {
      smartContractSecurity: {
        score: 96,
        weight: 0.30,
        factorName: 'Smart Contract Security & Audits',
        explanation: 'Audited by OpenZeppelin, Trail of Bits, CertiK, and Sigma Prime. Formal verification complete.',
      },
      liquidityRisk: {
        score: 94,
        weight: 0.25,
        factorName: 'Liquidity & Solvency Risk',
        explanation: '$12.4B+ in multi-chain reserves with continuous interest rate curve dynamic equilibrium.',
      },
      protocolStability: {
        score: 95,
        weight: 0.15,
        factorName: 'Protocol Stability & Age',
        explanation: 'Live on mainnet through 2 full bear market liquidity shocks without bad debt insolvency.',
      },
      historicalPerformance: {
        score: 90,
        weight: 0.10,
        factorName: 'Historical Yield Performance',
        explanation: 'Predictable supply yields driven purely by organic borrower interest demand.',
      },
      decentralization: {
        score: 88,
        weight: 0.10,
        factorName: 'Governance Decentralization',
        explanation: 'Fully autonomous governance with cross-chain voting relay contracts.',
      },
      marketVolatility: {
        score: 91,
        weight: 0.10,
        factorName: 'Market Volatility Resilience',
        explanation: 'Automated third-party liquidator bot competition guarantees immediate collateral liquidation.',
      },
    },
    auditReports: [
      { auditor: 'OpenZeppelin', date: '2022-01-27', scope: 'Aave v3 Core & PoolLogic', reportUrl: 'https://blog.openzeppelin.com', score: 98, criticalIssues: 0, highIssues: 0, mediumIssues: 2, lowIssues: 4, allResolved: true },
      { auditor: 'Trail of Bits', date: '2022-02-14', scope: 'Math & Liquidation Engine', reportUrl: 'https://trailofbits.com', score: 96, criticalIssues: 0, highIssues: 1, mediumIssues: 3, lowIssues: 2, allResolved: true },
      { auditor: 'CertiK', date: '2022-03-05', scope: 'Cross-chain Portal & Bridges', reportUrl: 'https://certik.com', score: 95, criticalIssues: 0, highIssues: 0, mediumIssues: 1, lowIssues: 3, allResolved: true },
    ],
    historicalYield: [
      { date: '2024-06', apy: 5.1, tvl: 10800000000 },
      { date: '2024-07', apy: 5.4, tvl: 11200000000 },
      { date: '2024-08', apy: 5.9, tvl: 11650000000 },
      { date: '2024-09', apy: 5.6, tvl: 11900000000 },
      { date: '2024-10', apy: 6.1, tvl: 12200000000 },
      { date: '2024-11', apy: 5.85, tvl: 12450000000 },
    ],
    keyFeatures: ['Flash Loans', 'Isolation Mode', 'Cross-chain Portal', 'E-Mode Collateral Efficiency'],
    supportedAssets: ['USDC', 'USDT', 'WETH', 'WBTC', 'DAI', 'wstETH'],
  },
  {
    name: 'MakerDAO (Sky)',
    slug: 'makerdao',
    symbol: 'SKY',
    logo: 'https://cryptologos.cc/logos/maker-mkr-logo.svg?v=035',
    category: 'CDP / Stablecoin',
    chains: ['Ethereum'],
    currentApy: 6.25,
    tvl: 9100000000,
    liquidityStatus: 'Deep',
    utilizationRate: 72,
    auditStatus: 'Multi-Audited',
    auditCount: 5,
    securityScore: 94,
    riskScore: 90,
    riskLevel: 'Low',
    protocolAgeYears: 7.0,
    launchDate: '2017-12-18',
    description: 'Decentralized credit platform that powers USDS/DAI stablecoin backed by over-collateralized assets and US Treasury RWA.',
    website: 'https://sky.money',
    github: 'https://github.com/makerdao/dss',
    docsUrl: 'https://docs.makerdao.com',
    tokenContract: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    governanceModel: 'MKR/SKY Tokenholder Governance and Executive Spell Timelocks.',
    smartContractDetails: {
      upgradeability: 'Timelocked Proxy (48h+)',
      timelockHours: 48,
      multiSigRequirement: 'Maker Governance Security Module (GSM)',
      adminControlRisk: 'Low (Decentralized Timelock)',
      centralizationRisk: 'Moderately Decentralized',
      openVulnerabilities: 0,
      insuranceFundCovered: true,
      insuranceFundUsd: 140000000,
      bugBountyMax: 2000000,
      securityIncidents: [
        {
          date: '2020-03-12',
          description: 'Black Thursday gas spike 0-bid auction liquidation exploit.',
          fundsRecovered: true,
          amountLost: 4500000,
          resolution: 'Flap/Flop MKR mint auction recapitalized the protocol successfully.',
        },
      ],
    },
    riskFactorBreakdown: {
      smartContractSecurity: {
        score: 95,
        weight: 0.30,
        factorName: 'Smart Contract Security & Audits',
        explanation: 'DSS core codebase audited by Trail of Bits, ConsenSys, and Runtime Verification.',
      },
      liquidityRisk: {
        score: 91,
        weight: 0.25,
        factorName: 'Liquidity & Solvency Risk',
        explanation: 'Massive Peg Stability Module (PSM) and institutional RWA US Treasury collateral cushion.',
      },
      protocolStability: {
        score: 98,
        weight: 0.15,
        factorName: 'Protocol Stability & Age',
        explanation: 'Oldest active lending/CDP protocol in DeFi history with zero smart contract logic drain.',
      },
      historicalPerformance: {
        score: 88,
        weight: 0.10,
        factorName: 'Historical Yield Performance',
        explanation: 'Sky Savings Rate (SSR/DSR) backed by real yield from real-world asset bond yields.',
      },
      decentralization: {
        score: 83,
        weight: 0.10,
        factorName: 'Governance Decentralization',
        explanation: 'Extensive subDAO decentralization with transparent on-chain delegate voter oversight.',
      },
      marketVolatility: {
        score: 89,
        weight: 0.10,
        factorName: 'Market Volatility Resilience',
        explanation: 'Surplus buffer and multi-tiered liquidation Dutch auctions absorb market volatility.',
      },
    },
    auditReports: [
      { auditor: 'Trail of Bits', date: '2021-08-11', scope: 'Multi-Collateral Dai Core (DSS)', reportUrl: 'https://trailofbits.com', score: 97, criticalIssues: 0, highIssues: 0, mediumIssues: 1, lowIssues: 3, allResolved: true },
      { auditor: 'ConsenSys Diligence', date: '2021-11-20', scope: 'Peg Stability Module & Oracles', reportUrl: 'https://consensys.net', score: 94, criticalIssues: 0, highIssues: 0, mediumIssues: 2, lowIssues: 4, allResolved: true },
    ],
    historicalYield: [
      { date: '2024-06', apy: 6.5, tvl: 8500000000 },
      { date: '2024-07', apy: 6.0, tvl: 8700000000 },
      { date: '2024-08', apy: 6.0, tvl: 8900000000 },
      { date: '2024-09', apy: 6.25, tvl: 9000000000 },
      { date: '2024-10', apy: 6.5, tvl: 9150000000 },
      { date: '2024-11', apy: 6.25, tvl: 9100000000 },
    ],
    keyFeatures: ['Sky Savings Rate', 'Peg Stability Module (PSM)', 'RWA Collateral Backing', 'Decentralized Oracles'],
    supportedAssets: ['USDC', 'USDS', 'DAI', 'ETH', 'WBTC'],
  },
  {
    name: 'Compound v3',
    slug: 'compound',
    symbol: 'COMP',
    logo: 'https://cryptologos.cc/logos/compound-comp-logo.svg?v=035',
    category: 'Lending',
    chains: ['Ethereum', 'Arbitrum', 'Polygon', 'Optimism', 'Base'],
    currentApy: 5.40,
    tvl: 3400000000,
    liquidityStatus: 'Deep',
    utilizationRate: 64,
    auditStatus: 'Multi-Audited',
    auditCount: 4,
    securityScore: 92,
    riskScore: 88,
    riskLevel: 'Low',
    protocolAgeYears: 5.5,
    launchDate: '2019-05-07',
    description: 'Algorithmic, autonomous interest rate protocol built for developers to unlock a universe of open financial applications.',
    website: 'https://compound.finance',
    github: 'https://github.com/compound-finance/comet',
    docsUrl: 'https://docs.compound.finance',
    tokenContract: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    governanceModel: 'COMP Autonomous Governance Timelock with 7-day vote delay.',
    smartContractDetails: {
      upgradeability: 'Timelocked Proxy (48h+)',
      timelockHours: 48,
      multiSigRequirement: 'Compound Community Multi-Sig',
      adminControlRisk: 'Low (Decentralized Timelock)',
      centralizationRisk: 'Decentralized',
      openVulnerabilities: 0,
      insuranceFundCovered: true,
      insuranceFundUsd: 45000000,
      bugBountyMax: 1000000,
      securityIncidents: [
        {
          date: '2021-09-30',
          description: 'COMP distribution bug in Comptroller after proposal 62 implementation.',
          fundsRecovered: true,
          amountLost: 80000000,
          resolution: 'Patched and community returned substantial portion of distributed funds.',
        },
      ],
    },
    riskFactorBreakdown: {
      smartContractSecurity: {
        score: 93,
        weight: 0.30,
        factorName: 'Smart Contract Security & Audits',
        explanation: 'Comet architecture audited by OpenZeppelin and ChainSecurity with isolated collateral pools.',
      },
      liquidityRisk: {
        score: 89,
        weight: 0.25,
        factorName: 'Liquidity & Solvency Risk',
        explanation: 'Isolated single-borrowable asset model prevents cross-collateral systemic contagion.',
      },
      protocolStability: {
        score: 92,
        weight: 0.15,
        factorName: 'Protocol Stability & Age',
        explanation: 'Pioneer of decentralized lending with over 5 years of uninterrupted service.',
      },
      historicalPerformance: {
        score: 86,
        weight: 0.10,
        factorName: 'Historical Yield Performance',
        explanation: 'Very stable USDC and ETH supply APYs with steady institutional deposit inflow.',
      },
      decentralization: {
        score: 85,
        weight: 0.10,
        factorName: 'Governance Decentralization',
        explanation: 'Standard open governor model with decentralized community proposals.',
      },
      marketVolatility: {
        score: 87,
        weight: 0.10,
        factorName: 'Market Volatility Resilience',
        explanation: 'Kink-based interest rate model accelerates borrowing cost when liquidity tightens.',
      },
    },
    auditReports: [
      { auditor: 'OpenZeppelin', date: '2022-08-01', scope: 'Compound III Comet Protocol', reportUrl: 'https://blog.openzeppelin.com', score: 95, criticalIssues: 0, highIssues: 0, mediumIssues: 2, lowIssues: 3, allResolved: true },
      { auditor: 'ChainSecurity', date: '2022-08-15', scope: 'Comet Math & Price Feed Oracles', reportUrl: 'https://chainsecurity.com', score: 92, criticalIssues: 0, highIssues: 1, mediumIssues: 2, lowIssues: 2, allResolved: true },
    ],
    historicalYield: [
      { date: '2024-06', apy: 4.8, tvl: 3100000000 },
      { date: '2024-07', apy: 5.1, tvl: 3250000000 },
      { date: '2024-08', apy: 5.3, tvl: 3300000000 },
      { date: '2024-09', apy: 5.2, tvl: 3350000000 },
      { date: '2024-10', apy: 5.5, tvl: 3420000000 },
      { date: '2024-11', apy: 5.4, tvl: 3400000000 },
    ],
    keyFeatures: ['Comet Isolated Markets', 'Dynamic Kink Interest Rates', 'Direct Liquidation Absorption'],
    supportedAssets: ['USDC', 'USDT', 'WETH', 'WBTC'],
  },
  {
    name: 'Uniswap v3',
    slug: 'uniswap',
    symbol: 'UNI',
    logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.svg?v=035',
    category: 'DEX',
    chains: ['Ethereum', 'Arbitrum', 'Polygon', 'Optimism', 'Base', 'Avalanche'],
    currentApy: 11.20,
    tvl: 5800000000,
    liquidityStatus: 'Deep',
    utilizationRate: 85,
    auditStatus: 'Multi-Audited',
    auditCount: 4,
    securityScore: 98,
    riskScore: 89,
    riskLevel: 'Low',
    protocolAgeYears: 5.9,
    launchDate: '2018-11-02',
    description: 'Premier decentralized trading protocol utilizing concentrated liquidity automated market makers.',
    website: 'https://uniswap.org',
    github: 'https://github.com/uniswap/v3-core',
    docsUrl: 'https://docs.uniswap.org',
    tokenContract: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    governanceModel: 'Autonomous Immutable Core with UNI DAO Fee Switch Governance.',
    smartContractDetails: {
      upgradeability: 'Immutable',
      timelockHours: 0,
      multiSigRequirement: 'None - Core Contracts are Immutable & Unchangeable',
      adminControlRisk: 'Low (Decentralized Timelock)',
      centralizationRisk: 'Decentralized',
      openVulnerabilities: 0,
      insuranceFundCovered: false,
      insuranceFundUsd: 0,
      bugBountyMax: 3000000,
      securityIncidents: [],
    },
    riskFactorBreakdown: {
      smartContractSecurity: {
        score: 99,
        weight: 0.30,
        factorName: 'Smart Contract Security & Audits',
        explanation: 'Audited by Trail of Bits and dapphub. Core smart contracts are 100% immutable and non-upgradable.',
      },
      liquidityRisk: {
        score: 92,
        weight: 0.25,
        factorName: 'Liquidity & Solvency Risk',
        explanation: 'Highest trading volume in web3; concentrated tick liquidity offers 4000x capital efficiency.',
      },
      protocolStability: {
        score: 96,
        weight: 0.15,
        factorName: 'Protocol Stability & Age',
        explanation: 'Zero exploits in v3 core since inception; processed over $2 Trillion in volume.',
      },
      historicalPerformance: {
        score: 75,
        weight: 0.10,
        factorName: 'Historical Yield Performance',
        explanation: 'Fee APY fluctuates with market trading volume and requires active LP tick management to prevent impermanent loss.',
      },
      decentralization: {
        score: 95,
        weight: 0.10,
        factorName: 'Governance Decentralization',
        explanation: 'Truly permissionless factory contracts without whitelist or admin pause switches.',
      },
      marketVolatility: {
        score: 74,
        weight: 0.10,
        factorName: 'Market Volatility Resilience',
        explanation: 'Impermanent loss increases during massive one-directional price movements.',
      },
    },
    auditReports: [
      { auditor: 'Trail of Bits', date: '2021-03-20', scope: 'Uniswap v3 Core Math & Tick Manager', reportUrl: 'https://trailofbits.com', score: 99, criticalIssues: 0, highIssues: 0, mediumIssues: 0, lowIssues: 2, allResolved: true },
      { auditor: 'ABDK Consulting', date: '2021-04-12', scope: 'Full Binary & Fixed Point Arithmetic', reportUrl: 'https://abdk.consulting', score: 98, criticalIssues: 0, highIssues: 0, mediumIssues: 1, lowIssues: 1, allResolved: true },
    ],
    historicalYield: [
      { date: '2024-06', apy: 9.8, tvl: 5200000000 },
      { date: '2024-07', apy: 10.4, tvl: 5400000000 },
      { date: '2024-08', apy: 12.1, tvl: 5650000000 },
      { date: '2024-09', apy: 10.8, tvl: 5720000000 },
      { date: '2024-10', apy: 11.5, tvl: 5850000000 },
      { date: '2024-11', apy: 11.2, tvl: 5800000000 },
    ],
    keyFeatures: ['Concentrated Liquidity', 'Flexible Fee Tiers (0.01%, 0.05%, 0.3%, 1%)', 'Non-Fungible Positions (NFT LP)', 'Geometric TWAP Oracles'],
    supportedAssets: ['USDC/ETH', 'USDT/USDC', 'WBTC/ETH', 'DAI/USDC'],
  },
  {
    name: 'Lido Finance',
    slug: 'lido',
    symbol: 'LDO',
    logo: 'https://cryptologos.cc/logos/lido-dao-ldo-logo.svg?v=035',
    category: 'Liquid Staking',
    chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism'],
    currentApy: 3.45,
    tvl: 28500000000,
    liquidityStatus: 'Deep',
    utilizationRate: 98,
    auditStatus: 'Multi-Audited',
    auditCount: 7,
    securityScore: 95,
    riskScore: 91,
    riskLevel: 'Low',
    protocolAgeYears: 4.1,
    launchDate: '2020-12-19',
    description: 'Industry standard liquid staking solution for Ethereum allowing users to earn beacon chain staking rewards while retaining capital liquidity with stETH.',
    website: 'https://lido.fi',
    github: 'https://github.com/lidofinance',
    docsUrl: 'https://docs.lido.fi',
    tokenContract: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    governanceModel: 'LDO Dual-Governance (LDO + stETH veto mechanism).',
    smartContractDetails: {
      upgradeability: 'Timelocked Proxy (48h+)',
      timelockHours: 72,
      multiSigRequirement: 'Lido Emergency Multi-Sig with stETH Veto Engine',
      adminControlRisk: 'Low (Decentralized Timelock)',
      centralizationRisk: 'Moderately Decentralized',
      openVulnerabilities: 0,
      insuranceFundCovered: true,
      insuranceFundUsd: 85000000,
      bugBountyMax: 2000000,
      securityIncidents: [],
    },
    riskFactorBreakdown: {
      smartContractSecurity: {
        score: 97,
        weight: 0.30,
        factorName: 'Smart Contract Security & Audits',
        explanation: '7 audits by Sigma Prime, ChainSecurity, MixBytes, and Statemind on v2 withdrawals.',
      },
      liquidityRisk: {
        score: 95,
        weight: 0.25,
        factorName: 'Liquidity & Solvency Risk',
        explanation: 'Over $28 Billion TVL with native on-chain unstaking buffer and deep secondary market peg.',
      },
      protocolStability: {
        score: 94,
        weight: 0.15,
        factorName: 'Protocol Stability & Age',
        explanation: 'Operated across Ethereum transitions (The Merge, Shapella withdrawals) without incident.',
      },
      historicalPerformance: {
        score: 92,
        weight: 0.10,
        factorName: 'Historical Yield Performance',
        explanation: 'Directly tracks Ethereum proof-of-stake consensus rewards with predictable 3.0%-3.8% return.',
      },
      decentralization: {
        score: 78,
        weight: 0.10,
        factorName: 'Governance Decentralization',
        explanation: '30+ vetted professional node operator sets; expanding Community Staking Module (CSM).',
      },
      marketVolatility: {
        score: 92,
        weight: 0.10,
        factorName: 'Market Volatility Resilience',
        explanation: 'Direct 1:1 backing with Ethereum validators ensures stETH peg recovery under stress.',
      },
    },
    auditReports: [
      { auditor: 'Sigma Prime', date: '2023-04-10', scope: 'Lido v2 Staking Router & Withdrawals', reportUrl: 'https://sigmaprime.io', score: 98, criticalIssues: 0, highIssues: 0, mediumIssues: 1, lowIssues: 2, allResolved: true },
      { auditor: 'Statemind', date: '2023-04-15', scope: 'Withdrawal Queue & NFT Verification', reportUrl: 'https://statemind.io', score: 96, criticalIssues: 0, highIssues: 0, mediumIssues: 2, lowIssues: 3, allResolved: true },
    ],
    historicalYield: [
      { date: '2024-06', apy: 3.2, tvl: 26000000000 },
      { date: '2024-07', apy: 3.3, tvl: 27100000000 },
      { date: '2024-08', apy: 3.5, tvl: 27800000000 },
      { date: '2024-09', apy: 3.4, tvl: 28100000000 },
      { date: '2024-10', apy: 3.6, tvl: 28400000000 },
      { date: '2024-11', apy: 3.45, tvl: 28500000000 },
    ],
    keyFeatures: ['Liquid Staking (wstETH)', 'Staking Router Modular Operators', 'Native Shapella Withdrawals', 'DeFi Collateral Integration'],
    supportedAssets: ['ETH', 'wstETH', 'stETH'],
  },
  {
    name: 'Curve Finance',
    slug: 'curve',
    symbol: 'CRV',
    logo: 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.svg?v=035',
    category: 'DEX',
    chains: ['Ethereum', 'Arbitrum', 'Polygon', 'Optimism', 'Avalanche', 'Base'],
    currentApy: 8.75,
    tvl: 2100000000,
    liquidityStatus: 'Healthy',
    utilizationRate: 74,
    auditStatus: 'Multi-Audited',
    auditCount: 5,
    securityScore: 86,
    riskScore: 78,
    riskLevel: 'Moderate',
    protocolAgeYears: 4.8,
    launchDate: '2020-01-20',
    description: 'Decentralized exchange optimized for extremely low slippage stablecoin and pegged asset swaps using Stableswap invariant.',
    website: 'https://curve.fi',
    github: 'https://github.com/curvefi/curve-contract',
    docsUrl: 'https://docs.curve.fi',
    tokenContract: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    governanceModel: 'veCRV Voting Escrow Governance with Gauge Weight voting.',
    smartContractDetails: {
      upgradeability: 'Immutable',
      timelockHours: 0,
      multiSigRequirement: 'Curve Emergency DAO 9-of-12',
      adminControlRisk: 'Moderate (Multisig Guarded)',
      centralizationRisk: 'Decentralized',
      openVulnerabilities: 0,
      insuranceFundCovered: false,
      insuranceFundUsd: 0,
      bugBountyMax: 1000000,
      securityIncidents: [
        {
          date: '2023-07-30',
          description: 'Vyper compiler reentrancy vulnerability in legacy pools (alETH, msETH, pETH).',
          fundsRecovered: true,
          amountLost: 61000000,
          resolution: 'Whitehats recovered majority of funds; affected pools deprecated and recompensed.',
        },
      ],
    },
    riskFactorBreakdown: {
      smartContractSecurity: {
        score: 82,
        weight: 0.30,
        factorName: 'Smart Contract Security & Audits',
        explanation: 'Audited by Trail of Bits and Quantstamp; affected 2023 Vyper compiler flaw resolved in all current pools.',
      },
      liquidityRisk: {
        score: 84,
        weight: 0.25,
        factorName: 'Liquidity & Solvency Risk',
        explanation: 'Concentrated stablecoin liquidity pools with active arbitrageurs.',
      },
      protocolStability: {
        score: 86,
        weight: 0.15,
        factorName: 'Protocol Stability & Age',
        explanation: 'Core backbone of web3 foreign exchange for pegged tokens.',
      },
      historicalPerformance: {
        score: 72,
        weight: 0.10,
        factorName: 'Historical Yield Performance',
        explanation: 'Boosted yields dependent on CRV token emission gauge distribution.',
      },
      decentralization: {
        score: 80,
        weight: 0.10,
        factorName: 'Governance Decentralization',
        explanation: 'veCRV model is widely praised for long-term stakeholder incentive alignment.',
      },
      marketVolatility: {
        score: 71,
        weight: 0.10,
        factorName: 'Market Volatility Resilience',
        explanation: 'De-pegging of any asset in a 3pool can cause toxic inventory imbalance.',
      },
    },
    auditReports: [
      { auditor: 'Trail of Bits', date: '2020-03-10', scope: 'Curve Stableswap Invariant', reportUrl: 'https://trailofbits.com', score: 92, criticalIssues: 0, highIssues: 1, mediumIssues: 2, lowIssues: 2, allResolved: true },
      { auditor: 'Quantstamp', date: '2021-06-05', scope: 'Curve CryptoSwap v2 Pools', reportUrl: 'https://quantstamp.com', score: 90, criticalIssues: 0, highIssues: 0, mediumIssues: 3, lowIssues: 2, allResolved: true },
    ],
    historicalYield: [
      { date: '2024-06', apy: 7.9, tvl: 1950000000 },
      { date: '2024-07', apy: 8.2, tvl: 2000000000 },
      { date: '2024-08', apy: 8.9, tvl: 2050000000 },
      { date: '2024-09', apy: 8.4, tvl: 2080000000 },
      { date: '2024-10', apy: 9.1, tvl: 2150000000 },
      { date: '2024-11', apy: 8.75, tvl: 2100000000 },
    ],
    keyFeatures: ['Stableswap Invariant (A-factor)', 'veCRV Gauge Voting', 'CryptoSwap Volatile Pools', 'crvUSD Collateralized Debt Engine'],
    supportedAssets: ['USDC/USDT/DAI (3pool)', 'stETH/ETH', 'crvUSD/USDC'],
  },
  {
    name: 'Rocket Pool',
    slug: 'rocket-pool',
    symbol: 'RPL',
    logo: 'https://cryptologos.cc/logos/rocket-pool-rpl-logo.svg?v=035',
    category: 'Liquid Staking',
    chains: ['Ethereum', 'Arbitrum', 'Optimism'],
    currentApy: 3.65,
    tvl: 4100000000,
    liquidityStatus: 'Healthy',
    utilizationRate: 94,
    auditStatus: 'Multi-Audited',
    auditCount: 4,
    securityScore: 94,
    riskScore: 89,
    riskLevel: 'Low',
    protocolAgeYears: 3.5,
    launchDate: '2021-11-09',
    description: 'Decentralized Ethereum liquid staking protocol designed to be trustless, permissionless and community-owned.',
    website: 'https://rocketpool.net',
    github: 'https://github.com/rocket-pool',
    docsUrl: 'https://docs.rocketpool.net',
    tokenContract: '0xD33526068D116cE69F19A9ee46E0a10498813709',
    governanceModel: 'Decentralized Protocol DAO (pDAO) and Oracle DAO (oDAO).',
    smartContractDetails: {
      upgradeability: 'Timelocked Proxy (48h+)',
      timelockHours: 48,
      multiSigRequirement: 'pDAO Voting Engine',
      adminControlRisk: 'Low (Decentralized Timelock)',
      centralizationRisk: 'Decentralized',
      openVulnerabilities: 0,
      insuranceFundCovered: true,
      insuranceFundUsd: 35000000,
      bugBountyMax: 1000000,
      securityIncidents: [],
    },
    riskFactorBreakdown: {
      smartContractSecurity: {
        score: 95,
        weight: 0.30,
        factorName: 'Smart Contract Security & Audits',
        explanation: 'Audited by Sigma Prime and ConsenSys Diligence. Outstanding permissionless minipool architecture.',
      },
      liquidityRisk: {
        score: 87,
        weight: 0.25,
        factorName: 'Liquidity & Solvency Risk',
        explanation: 'rETH liquidity depth supports institutional swap orders with zero slashing event history.',
      },
      protocolStability: {
        score: 91,
        weight: 0.15,
        factorName: 'Protocol Stability & Age',
        explanation: 'Over 3,500 independent decentralized node operators powering trustless validators.',
      },
      historicalPerformance: {
        score: 90,
        weight: 0.10,
        factorName: 'Historical Yield Performance',
        explanation: 'Pure Ethereum validator staking yield with slight boost from commission fees.',
      },
      decentralization: {
        score: 96,
        weight: 0.10,
        factorName: 'Governance Decentralization',
        explanation: 'Highest node decentralization index among all liquid staking providers.',
      },
      marketVolatility: {
        score: 88,
        weight: 0.10,
        factorName: 'Market Volatility Resilience',
        explanation: 'Node operator collateral bonds guarantee depositor principal protection.',
      },
    },
    auditReports: [
      { auditor: 'ConsenSys Diligence', date: '2021-09-15', scope: 'Rocket Pool Smart Contracts v1', reportUrl: 'https://consensys.net', score: 96, criticalIssues: 0, highIssues: 0, mediumIssues: 1, lowIssues: 3, allResolved: true },
      { auditor: 'Sigma Prime', date: '2021-10-02', scope: 'Minipool Manager & Deposit Queue', reportUrl: 'https://sigmaprime.io', score: 94, criticalIssues: 0, highIssues: 0, mediumIssues: 2, lowIssues: 2, allResolved: true },
    ],
    historicalYield: [
      { date: '2024-06', apy: 3.4, tvl: 3700000000 },
      { date: '2024-07', apy: 3.5, tvl: 3850000000 },
      { date: '2024-08', apy: 3.7, tvl: 3950000000 },
      { date: '2024-09', apy: 3.6, tvl: 4020000000 },
      { date: '2024-10', apy: 3.8, tvl: 4080000000 },
      { date: '2024-11', apy: 3.65, tvl: 4100000000 },
    ],
    keyFeatures: ['Permissionless Node Operators (8 ETH Minipools)', 'rETH Liquid Token', 'Node Operator Bond Backing'],
    supportedAssets: ['ETH', 'rETH'],
  },
  {
    name: 'Pendle Finance',
    slug: 'pendle',
    symbol: 'PENDLE',
    logo: 'https://cryptologos.cc/logos/pendle-pendle-logo.svg?v=035',
    category: 'Derivatives',
    chains: ['Ethereum', 'Arbitrum', 'Optimism', 'Base'],
    currentApy: 14.80,
    tvl: 3200000000,
    liquidityStatus: 'Healthy',
    utilizationRate: 88,
    auditStatus: 'Multi-Audited',
    auditCount: 4,
    securityScore: 88,
    riskScore: 74,
    riskLevel: 'Moderate',
    protocolAgeYears: 3.4,
    launchDate: '2021-06-15',
    description: 'DeFi yield-trading protocol that allows users to tokenize and trade future yield via Principle Tokens (PT) and Yield Tokens (YT).',
    website: 'https://pendle.finance',
    github: 'https://github.com/pendle-finance',
    docsUrl: 'https://docs.pendle.finance',
    tokenContract: '0x808507121B80c02388fAd14726482e061B8da827',
    governanceModel: 'vePENDLE Governance & Dynamic AMM Pool Gauges.',
    smartContractDetails: {
      upgradeability: 'Timelocked Proxy (48h+)',
      timelockHours: 48,
      multiSigRequirement: 'Pendle 5-of-8 Council Multisig',
      adminControlRisk: 'Moderate (Multisig Guarded)',
      centralizationRisk: 'Moderately Decentralized',
      openVulnerabilities: 0,
      insuranceFundCovered: false,
      insuranceFundUsd: 0,
      bugBountyMax: 1000000,
      securityIncidents: [],
    },
    riskFactorBreakdown: {
      smartContractSecurity: {
        score: 89,
        weight: 0.30,
        factorName: 'Smart Contract Security & Audits',
        explanation: 'Audited by Ackee Blockchain, Dedaub, and WatchPug. Novel yield tokenization math.',
      },
      liquidityRisk: {
        score: 72,
        weight: 0.25,
        factorName: 'Liquidity & Solvency Risk',
        explanation: 'Liquidity is locked until market maturity date; early redemption requires AMM swap slippage.',
      },
      protocolStability: {
        score: 76,
        weight: 0.15,
        factorName: 'Protocol Stability & Age',
        explanation: 'Rapid growth driven by restaking (LRT) wave; zero security compromises.',
      },
      historicalPerformance: {
        score: 65,
        weight: 0.10,
        factorName: 'Historical Yield Performance',
        explanation: 'Fixed APY on PT is mathematically locked, while YT carries speculative duration risk.',
      },
      decentralization: {
        score: 70,
        weight: 0.10,
        factorName: 'Governance Decentralization',
        explanation: 'vePENDLE voting active, core team retains emergency market deployment keys.',
      },
      marketVolatility: {
        score: 68,
        weight: 0.10,
        factorName: 'Market Volatility Resilience',
        explanation: 'Underlying assets (LRTs/sUSDe) carry upstream smart contract dependency risks.',
      },
    },
    auditReports: [
      { auditor: 'Ackee Blockchain', date: '2023-02-18', scope: 'Pendle v2 Yield AMM & Router', reportUrl: 'https://ackee.xyz', score: 92, criticalIssues: 0, highIssues: 0, mediumIssues: 2, lowIssues: 2, allResolved: true },
      { auditor: 'Dedaub', date: '2023-04-01', scope: 'Fixed Yield Math & Expiry Engine', reportUrl: 'https://dedaub.com', score: 90, criticalIssues: 0, highIssues: 1, mediumIssues: 1, lowIssues: 2, allResolved: true },
    ],
    historicalYield: [
      { date: '2024-06', apy: 13.2, tvl: 2400000000 },
      { date: '2024-07', apy: 14.1, tvl: 2750000000 },
      { date: '2024-08', apy: 15.6, tvl: 2950000000 },
      { date: '2024-09', apy: 14.2, tvl: 3050000000 },
      { date: '2024-10', apy: 15.1, tvl: 3150000000 },
      { date: '2024-11', apy: 14.8, tvl: 3200000000 },
    ],
    keyFeatures: ['Fixed APY Principal Tokens (PT)', 'Yield Tokens (YT)', 'Yield Trading AMM', 'Maturity Expiry Settler'],
    supportedAssets: ['PT-sUSDe', 'PT-eETH', 'PT-USDC', 'YT-weETH'],
  },
  {
    name: 'Convex Finance',
    slug: 'convex',
    symbol: 'CVX',
    logo: 'https://cryptologos.cc/logos/convex-finance-cvx-logo.svg?v=035',
    category: 'Yield Aggregator',
    chains: ['Ethereum', 'Arbitrum', 'Polygon'],
    currentApy: 12.40,
    tvl: 1850000000,
    liquidityStatus: 'Healthy',
    utilizationRate: 80,
    auditStatus: 'Multi-Audited',
    auditCount: 3,
    securityScore: 84,
    riskScore: 72,
    riskLevel: 'Moderate',
    protocolAgeYears: 3.7,
    launchDate: '2021-05-17',
    description: 'DeFi yield booster protocol allowing Curve and Frax liquidity providers to earn boosted CRV, FXS, and CVX without locking veCRV directly.',
    website: 'https://convexfinance.com',
    github: 'https://github.com/convex-eth',
    docsUrl: 'https://docs.convexfinance.com',
    tokenContract: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
    governanceModel: 'vlCVX Vote-locked Governance & Curve Gauge proxy voting.',
    smartContractDetails: {
      upgradeability: 'Immutable',
      timelockHours: 0,
      multiSigRequirement: 'Convex Multisig 3-of-5',
      adminControlRisk: 'Moderate (Multisig Guarded)',
      centralizationRisk: 'Moderately Decentralized',
      openVulnerabilities: 0,
      insuranceFundCovered: false,
      insuranceFundUsd: 0,
      bugBountyMax: 500000,
      securityIncidents: [],
    },
    riskFactorBreakdown: {
      smartContractSecurity: {
        score: 84,
        weight: 0.30,
        factorName: 'Smart Contract Security & Audits',
        explanation: 'Audited by MixBytes and PeckShield. Battle-tested booster contracts holding significant veCRV.',
      },
      liquidityRisk: {
        score: 75,
        weight: 0.25,
        factorName: 'Liquidity & Solvency Risk',
        explanation: 'cvxCRV secondary market discount can fluctuate against native CRV token value.',
      },
      protocolStability: {
        score: 82,
        weight: 0.15,
        factorName: 'Protocol Stability & Age',
        explanation: 'Operated smoothly through Curve ecosystem wars with continuous reward distribution.',
      },
      historicalPerformance: {
        score: 70,
        weight: 0.10,
        factorName: 'Historical Yield Performance',
        explanation: 'Yields are heavily reliant on market price of incentive tokens (CRV/CVX).',
      },
      decentralization: {
        score: 62,
        weight: 0.10,
        factorName: 'Governance Decentralization',
        explanation: 'Core booster contracts controlled by a compact multi-signature signer council.',
      },
      marketVolatility: {
        score: 66,
        weight: 0.10,
        factorName: 'Market Volatility Resilience',
        explanation: 'Tokenomics sensitive to Curve DAO governance bribes and gauge weight shifts.',
      },
    },
    auditReports: [
      { auditor: 'MixBytes', date: '2021-05-10', scope: 'Convex Booster & Staking Contracts', reportUrl: 'https://mixbytes.io', score: 88, criticalIssues: 0, highIssues: 0, mediumIssues: 2, lowIssues: 2, allResolved: true },
      { auditor: 'PeckShield', date: '2021-06-01', scope: 'Locking & Bribe Forwarders', reportUrl: 'https://peckshield.com', score: 86, criticalIssues: 0, highIssues: 1, mediumIssues: 2, lowIssues: 3, allResolved: true },
    ],
    historicalYield: [
      { date: '2024-06', apy: 11.1, tvl: 1650000000 },
      { date: '2024-07', apy: 11.8, tvl: 1720000000 },
      { date: '2024-08', apy: 13.0, tvl: 1790000000 },
      { date: '2024-09', apy: 12.2, tvl: 1810000000 },
      { date: '2024-10', apy: 12.8, tvl: 1840000000 },
      { date: '2024-11', apy: 12.4, tvl: 1850000000 },
    ],
    keyFeatures: ['Boosted CRV Staking', 'No veCRV Locking Required', 'Bribe Yield Optimization', 'cvxCRV Liquid Wrapper'],
    supportedAssets: ['cvxCRV', 'cvxFXS', 'Curve 3pool LP', 'crvUSD LP'],
  },
  {
    name: 'Yearn Finance',
    slug: 'yearn',
    symbol: 'YFI',
    logo: 'https://cryptologos.cc/logos/yearn-finance-yfi-logo.svg?v=035',
    category: 'Yield Aggregator',
    chains: ['Ethereum', 'Arbitrum', 'Polygon', 'Optimism'],
    currentApy: 7.60,
    tvl: 650000000,
    liquidityStatus: 'Healthy',
    utilizationRate: 70,
    auditStatus: 'Multi-Audited',
    auditCount: 4,
    securityScore: 89,
    riskScore: 81,
    riskLevel: 'Low',
    protocolAgeYears: 4.8,
    launchDate: '2020-02-15',
    description: 'Decentralized suite of yield-optimizing smart contract vaults that autonomously rebalance capital into the highest paying safe strategies.',
    website: 'https://yearn.fi',
    github: 'https://github.com/yearn/yearn-vaults',
    docsUrl: 'https://docs.yearn.fi',
    tokenContract: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    governanceModel: 'YFI Tokenholder Governance with yChads Security Council.',
    smartContractDetails: {
      upgradeability: 'Timelocked Proxy (48h+)',
      timelockHours: 48,
      multiSigRequirement: 'Yearn Security Council 6-of-9',
      adminControlRisk: 'Low (Decentralized Timelock)',
      centralizationRisk: 'Decentralized',
      openVulnerabilities: 0,
      insuranceFundCovered: true,
      insuranceFundUsd: 15000000,
      bugBountyMax: 1000000,
      securityIncidents: [
        {
          date: '2021-02-04',
          description: 'DAI vault v1 flash-loan exploit draining $11M in fees.',
          fundsRecovered: true,
          amountLost: 11000000,
          resolution: 'Covered via Yearn treasury reserve fund; v2 architecture isolated strategies.',
        },
      ],
    },
    riskFactorBreakdown: {
      smartContractSecurity: {
        score: 91,
        weight: 0.30,
        factorName: 'Smart Contract Security & Audits',
        explanation: 'Audited by ChainSecurity and MixBytes. Yearn v3 multi-strategy architecture with debt reallocators.',
      },
      liquidityRisk: {
        score: 80,
        weight: 0.25,
        factorName: 'Liquidity & Solvency Risk',
        explanation: 'Unwinding complex strategy legs can have brief withdrawal queue times in illiquid conditions.',
      },
      protocolStability: {
        score: 87,
        weight: 0.15,
        factorName: 'Protocol Stability & Age',
        explanation: 'Forefather of DeFi yield vaults with an experienced developer and strategist network.',
      },
      historicalPerformance: {
        score: 81,
        weight: 0.10,
        factorName: 'Historical Yield Performance',
        explanation: 'Auto-compounds rewards into underlying deposit tokens with automated harvest routines.',
      },
      decentralization: {
        score: 82,
        weight: 0.10,
        factorName: 'Governance Decentralization',
        explanation: 'Community-driven strategists with public GitHub PR reviews and multisig execution.',
      },
      marketVolatility: {
        score: 79,
        weight: 0.10,
        factorName: 'Market Volatility Resilience',
        explanation: 'Automated debt rebalancing mitigates liquidation risks across underlying lending protocols.',
      },
    },
    auditReports: [
      { auditor: 'ChainSecurity', date: '2022-04-12', scope: 'Yearn Vaults v2/v3 Core', reportUrl: 'https://chainsecurity.com', score: 94, criticalIssues: 0, highIssues: 0, mediumIssues: 1, lowIssues: 3, allResolved: true },
      { auditor: 'MixBytes', date: '2023-01-20', scope: 'Multi-Strategy Allocator Engine', reportUrl: 'https://mixbytes.io', score: 90, criticalIssues: 0, highIssues: 0, mediumIssues: 2, lowIssues: 2, allResolved: true },
    ],
    historicalYield: [
      { date: '2024-06', apy: 6.9, tvl: 580000000 },
      { date: '2024-07', apy: 7.2, tvl: 600000000 },
      { date: '2024-08', apy: 8.1, tvl: 625000000 },
      { date: '2024-09', apy: 7.4, tvl: 635000000 },
      { date: '2024-10', apy: 7.9, tvl: 645000000 },
      { date: '2024-11', apy: 7.6, tvl: 650000000 },
    ],
    keyFeatures: ['Auto-Compounding Vaults', 'Automated Strategy Rebalancing', 'Single-Asset Deposit (yVaults)', 'Zero Deposit/Withdrawal Fees'],
    supportedAssets: ['yvUSDC', 'yvWETH', 'yvDAI', 'yvWBTC'],
  },
  {
    name: 'Balancer v2',
    slug: 'balancer',
    symbol: 'BAL',
    logo: 'https://cryptologos.cc/logos/balancer-bal-logo.svg?v=035',
    category: 'DEX',
    chains: ['Ethereum', 'Arbitrum', 'Polygon', 'Optimism', 'Avalanche', 'Base'],
    currentApy: 9.15,
    tvl: 1200000000,
    liquidityStatus: 'Healthy',
    utilizationRate: 71,
    auditStatus: 'Multi-Audited',
    auditCount: 5,
    securityScore: 88,
    riskScore: 82,
    riskLevel: 'Low',
    protocolAgeYears: 4.6,
    launchDate: '2020-03-31',
    description: 'Programmable liquidity protocol and automated portfolio manager offering custom weighted pools, boosted pools, and composable stable pools.',
    website: 'https://balancer.fi',
    github: 'https://github.com/balancer/balancer-v2-monorepo',
    docsUrl: 'https://docs.balancer.fi',
    tokenContract: '0xba100000625a3754423978a60c9317c58a424e3D',
    governanceModel: 'veBAL Voting Escrow & Emergency SubDAO.',
    smartContractDetails: {
      upgradeability: 'Immutable',
      timelockHours: 0,
      multiSigRequirement: 'Balancer Emergency SubDAO 4-of-7',
      adminControlRisk: 'Low (Decentralized Timelock)',
      centralizationRisk: 'Decentralized',
      openVulnerabilities: 0,
      insuranceFundCovered: false,
      insuranceFundUsd: 0,
      bugBountyMax: 1000000,
      securityIncidents: [
        {
          date: '2023-08-27',
          description: 'Rounding issue vulnerability in Composable Stable Pools.',
          fundsRecovered: true,
          amountLost: 2000000,
          resolution: 'Emergency SubDAO paused and drained affected pools; affected users fully repaid.',
        },
      ],
    },
    riskFactorBreakdown: {
      smartContractSecurity: {
        score: 87,
        weight: 0.30,
        factorName: 'Smart Contract Security & Audits',
        explanation: 'Audited by Trail of Bits, OpenZeppelin, and Certora formal verification.',
      },
      liquidityRisk: {
        score: 82,
        weight: 0.25,
        factorName: 'Liquidity & Solvency Risk',
        explanation: 'Single-vault architecture consolidates tokens, minimizing gas costs and token transfer overhead.',
      },
      protocolStability: {
        score: 86,
        weight: 0.15,
        factorName: 'Protocol Stability & Age',
        explanation: 'Pioneer of generalized N-asset pools with mathematical invariant invariant proofs.',
      },
      historicalPerformance: {
        score: 78,
        weight: 0.10,
        factorName: 'Historical Yield Performance',
        explanation: 'Dual yield generated from swap fees and idle lending interest in Boosted Pools.',
      },
      decentralization: {
        score: 81,
        weight: 0.10,
        factorName: 'Governance Decentralization',
        explanation: 'veBAL model with decentralized grant DAO and gauge distribution.',
      },
      marketVolatility: {
        score: 76,
        weight: 0.10,
        factorName: 'Market Volatility Resilience',
        explanation: 'Weighted pools (e.g. 80/20) significantly reduce impermanent loss compared to 50/50 AMMs.',
      },
    },
    auditReports: [
      { auditor: 'OpenZeppelin', date: '2021-04-20', scope: 'Balancer v2 Vault Architecture', reportUrl: 'https://blog.openzeppelin.com', score: 94, criticalIssues: 0, highIssues: 0, mediumIssues: 1, lowIssues: 3, allResolved: true },
      { auditor: 'Trail of Bits', date: '2021-04-28', scope: 'Weighted Pools & Mathematical Math', reportUrl: 'https://trailofbits.com', score: 92, criticalIssues: 0, highIssues: 0, mediumIssues: 2, lowIssues: 2, allResolved: true },
    ],
    historicalYield: [
      { date: '2024-06', apy: 8.4, tvl: 1050000000 },
      { date: '2024-07', apy: 8.9, tvl: 1100000000 },
      { date: '2024-08', apy: 9.8, tvl: 1150000000 },
      { date: '2024-09', apy: 9.0, tvl: 1180000000 },
      { date: '2024-10', apy: 9.5, tvl: 1220000000 },
      { date: '2024-11', apy: 9.15, tvl: 1200000000 },
    ],
    keyFeatures: ['Single Vault Architecture', '80/20 Weighted Governance Pools', 'Boosted Lending Pools', 'Internal Balances'],
    supportedAssets: ['wstETH/WETH', 'USDC/DAI/USDT', 'BAL/WETH 80/20'],
  },
];

const seedDatabase = async () => {
  console.log('[SEED] Starting institutional DeFi database seeding...');

  if (isInMemoryFallback()) {
    console.log('[SEED] Seeding in-memory database store...');
    const protocolsCol = inMemoryDB.getCollection('protocols');
    const usersCol = inMemoryDB.getCollection('users');
    const invCol = inMemoryDB.getCollection('investments');
    const txCol = inMemoryDB.getCollection('transactions');

    // Clear existing
    protocolsCol.clear();
    usersCol.clear();
    invCol.clear();
    txCol.clear();

    // Insert protocols
    SEED_PROTOCOLS.forEach((p, idx) => {
      const id = 'proto_' + p.slug;
      protocolsCol.set(id, { ...p, _id: id, id });
    });

    // Seed Demo User
    const demoId = 'demo_user_001';
    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash('demo1234', salt);

    const demoUser = {
      _id: demoId,
      id: demoId,
      name: 'Sarah Lin (Chief Risk Officer)',
      email: 'treasury@horizoncapital.fi',
      password: hashedPw,
      role: 'institutional_treasurer',
      organization: 'Horizon Capital DAO Treasury',
      riskTolerance: 'Balanced',
      preferredChains: ['Ethereum', 'Arbitrum', 'Polygon'],
      portfolioStats: {
        totalInvested: 250000,
        currentValue: 268420,
        earnedYield: 18420,
        weightedApy: 7.35,
        averageRiskScore: 84,
      },
      createdAt: new Date(),
    };
    usersCol.set(demoId, demoUser);

    // Seed Demo Positions
    const samplePositions = [
      {
        slug: 'aave',
        name: 'Aave v3',
        amount: 80000,
        currentVal: 84680,
        earned: 4680,
        apy: 5.85,
        risk: 92,
        riskLvl: 'Low',
        asset: 'USDC',
        chain: 'Ethereum',
        logo: 'https://cryptologos.cc/logos/aave-aave-logo.svg?v=035',
      },
      {
        slug: 'makerdao',
        name: 'MakerDAO (Sky)',
        amount: 70000,
        currentVal: 74375,
        earned: 4375,
        apy: 6.25,
        risk: 90,
        riskLvl: 'Low',
        asset: 'USDS',
        chain: 'Ethereum',
        logo: 'https://cryptologos.cc/logos/maker-mkr-logo.svg?v=035',
      },
      {
        slug: 'lido',
        name: 'Lido Finance',
        amount: 60000,
        currentVal: 62070,
        earned: 2070,
        apy: 3.45,
        risk: 91,
        riskLvl: 'Low',
        asset: 'wstETH',
        chain: 'Ethereum',
        logo: 'https://cryptologos.cc/logos/lido-dao-ldo-logo.svg?v=035',
      },
      {
        slug: 'uniswap',
        name: 'Uniswap v3',
        amount: 40000,
        currentVal: 47295,
        earned: 7295,
        apy: 11.20,
        risk: 89,
        riskLvl: 'Low',
        asset: 'USDC/ETH',
        chain: 'Arbitrum',
        logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.svg?v=035',
      },
    ];

    samplePositions.forEach((pos, i) => {
      const invId = 'inv_demo_' + i;
      const inv = {
        _id: invId,
        id: invId,
        userId: demoId,
        protocolId: 'proto_' + pos.slug,
        protocolName: pos.name,
        protocolSlug: pos.slug,
        protocolLogo: pos.logo,
        chain: pos.chain,
        assetSymbol: pos.asset,
        amountInvested: pos.amount,
        currentValue: pos.currentVal,
        earnedYield: pos.earned,
        currentApy: pos.apy,
        riskScore: pos.risk,
        riskLevel: pos.riskLvl,
        status: 'Active',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        strategyName: 'Balanced Institutional Treasury',
        createdAt: new Date(),
      };
      invCol.set(invId, inv);

      // Add corresponding transaction
      const txId = 'tx_demo_' + i;
      const tx = {
        _id: txId,
        id: txId,
        userId: demoId,
        protocolId: 'proto_' + pos.slug,
        protocolName: pos.name,
        type: 'DEPOSIT',
        amount: pos.amount,
        asset: pos.asset,
        chain: pos.chain,
        txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        status: 'CONFIRMED',
        gasFeeUsd: 4.15,
        notes: `Initial Treasury Allocation to ${pos.name}`,
        timestamp: new Date(Date.now() - (90 - i * 5) * 24 * 60 * 60 * 1000),
      };
      txCol.set(txId, tx);
    });

    console.log(`✅ [SEED] Seeded ${SEED_PROTOCOLS.length} protocols and demo portfolio in-memory.`);
    return;
  }

  // MongoDB Seeding
  try {
    await Protocol.deleteMany({});
    const insertedProtocols = await Protocol.insertMany(SEED_PROTOCOLS);
    console.log(`✅ [SEED] Inserted ${insertedProtocols.length} protocols into MongoDB.`);

    // Demo User
    const demoEmail = 'treasury@horizoncapital.fi';
    let user = await User.findOne({ email: demoEmail });
    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash('demo1234', salt);

    if (!user) {
      user = await User.create({
        name: 'Sarah Lin (Chief Risk Officer)',
        email: demoEmail,
        password: hashedPw,
        role: 'institutional_treasurer',
        organization: 'Horizon Capital DAO Treasury',
        riskTolerance: 'Balanced',
        preferredChains: ['Ethereum', 'Arbitrum', 'Polygon'],
        portfolioStats: {
          totalInvested: 250000,
          currentValue: 268420,
          earnedYield: 18420,
          weightedApy: 7.35,
          averageRiskScore: 84,
        },
      });
    }

    await Investment.deleteMany({ userId: user._id });
    await Transaction.deleteMany({ userId: user._id });

    // Find protocols
    const aave = insertedProtocols.find((p) => p.slug === 'aave');
    const maker = insertedProtocols.find((p) => p.slug === 'makerdao');
    const lido = insertedProtocols.find((p) => p.slug === 'lido');
    const uniswap = insertedProtocols.find((p) => p.slug === 'uniswap');

    const positions = [
      { protocol: aave, amount: 80000, val: 84680, earned: 4680, asset: 'USDC', chain: 'Ethereum' },
      { protocol: maker, amount: 70000, val: 74375, earned: 4375, asset: 'USDS', chain: 'Ethereum' },
      { protocol: lido, amount: 60000, val: 62070, earned: 2070, asset: 'wstETH', chain: 'Ethereum' },
      { protocol: uniswap, amount: 40000, val: 47295, earned: 7295, asset: 'USDC/ETH', chain: 'Arbitrum' },
    ];

    for (const pos of positions) {
      if (pos.protocol) {
        await Investment.create({
          userId: user._id,
          protocolId: pos.protocol._id,
          protocolName: pos.protocol.name,
          protocolSlug: pos.protocol.slug,
          protocolLogo: pos.protocol.logo,
          chain: pos.chain,
          assetSymbol: pos.asset,
          amountInvested: pos.amount,
          currentValue: pos.val,
          earnedYield: pos.earned,
          currentApy: pos.protocol.currentApy,
          riskScore: pos.protocol.riskScore,
          riskLevel: pos.protocol.riskLevel,
          status: 'Active',
          strategyName: 'Balanced Institutional Treasury',
        });

        await Transaction.create({
          userId: user._id,
          protocolId: pos.protocol._id,
          protocolName: pos.protocol.name,
          type: 'DEPOSIT',
          amount: pos.amount,
          asset: pos.asset,
          chain: pos.chain,
          notes: `Initial Treasury Allocation to ${pos.protocol.name}`,
        });
      }
    }

    console.log('✅ [SEED] Database seeded successfully with demo user, investments, and transactions.');
  } catch (err) {
    console.error('❌ [SEED] Error seeding MongoDB:', err);
  }
};

module.exports = {
  seedDatabase,
  SEED_PROTOCOLS,
};

if (require.main === module) {
  const { connectDB } = require('./config/db');
  require('dotenv').config();
  connectDB().then(() => {
    seedDatabase().then(() => {
      console.log('Seed execution completed.');
      process.exit(0);
    });
  });
}
