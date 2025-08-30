/**
 * File: interview-sla-calculator.js
 * Description: SLA/SLO calculations and reliability metrics for system design interviews
 * 
 * Learning objectives:
 * - Master availability calculations and error budget management
 * - Learn SLI/SLO/SLA definitions and practical applications
 * - Understand reliability engineering metrics and trade-offs
 * - Practice back-of-envelope calculations for system reliability
 * 
 * Time Complexity: O(1) for all calculations
 * Space Complexity: O(N) for historical data tracking
 */

// Standard availability levels and their corresponding downtimes
const AVAILABILITY_LEVELS = {
  '99.9%': { percentage: 0.999, name: 'Three Nines' },
  '99.95%': { percentage: 0.9995, name: 'Three Nine Five' },
  '99.99%': { percentage: 0.9999, name: 'Four Nines' },
  '99.999%': { percentage: 0.99999, name: 'Five Nines' },
  '99.9999%': { percentage: 0.999999, name: 'Six Nines' }
};

// Time periods for calculations
const TIME_PERIODS = {
  HOUR: 3600, // seconds
  DAY: 86400, // seconds  
  WEEK: 604800, // seconds
  MONTH: 2629746, // seconds (average month)
  QUARTER: 7889238, // seconds (3 months)
  YEAR: 31556952 // seconds (365.25 days)
};

// Common SLI types for different service categories
const SLI_TYPES = {
  AVAILABILITY: 'availability',
  LATENCY: 'latency',
  THROUGHPUT: 'throughput',
  ERROR_RATE: 'error_rate',
  DURABILITY: 'durability',
  CORRECTNESS: 'correctness'
};

/**
 * Comprehensive SLA/SLO Calculator for system reliability analysis
 * Provides interview-focused calculations and real-world scenarios
 */
class SLACalculator {
  constructor() {
    this.calculations = []; // Store calculation history
    this.serviceCatalog = new Map(); // Track multiple services
  }

  // ========================
  // Core Availability Calculations
  // ========================

  /**
   * Calculate downtime allowances for different availability levels
   * Essential for understanding SLA commitments
   */
  calculateDowntimeAllowances() {
    const calculation = {
      type: 'Downtime Allowances by Availability Level',
      results: {},
      insights: []
    };

    console.log('=== Downtime Allowances ===');
    
    Object.entries(AVAILABILITY_LEVELS).forEach(([level, config]) => {
      const unavailability = 1 - config.percentage;
      
      const downtimes = {
        perHour: this.formatTime(TIME_PERIODS.HOUR * unavailability),
        perDay: this.formatTime(TIME_PERIODS.DAY * unavailability),
        perWeek: this.formatTime(TIME_PERIODS.WEEK * unavailability),
        perMonth: this.formatTime(TIME_PERIODS.MONTH * unavailability),
        perYear: this.formatTime(TIME_PERIODS.YEAR * unavailability)
      };

      calculation.results[level] = {
        name: config.name,
        percentage: config.percentage,
        downtimes: downtimes
      };

      console.log(`\n${level} (${config.name}):`);
      console.log(`  Per Month: ${downtimes.perMonth}`);
      console.log(`  Per Year:  ${downtimes.perYear}`);
    });

    // Add insights about practical implications
    calculation.insights = [
      '99.9% allows ~43.8 minutes downtime per month - suitable for internal tools',
      '99.99% allows ~4.38 minutes downtime per month - suitable for business-critical services',
      '99.999% allows ~26.3 seconds downtime per month - requires significant investment',
      'Each additional 9 costs approximately 10x more to achieve and maintain'
    ];

    this.logCalculation(calculation);
    return calculation;
  }

  /**
   * Calculate actual availability from uptime/downtime data
   * Used for measuring SLA compliance
   */
  calculateActualAvailability(uptimeSeconds, totalPeriodSeconds) {
    const downtimeSeconds = totalPeriodSeconds - uptimeSeconds;
    const availability = uptimeSeconds / totalPeriodSeconds;
    const availabilityPercentage = availability * 100;

    const calculation = {
      type: 'Actual Availability Calculation',
      inputs: {
        uptimeSeconds,
        totalPeriodSeconds,
        downtimeSeconds
      },
      steps: [
        {
          description: 'Calculate downtime',
          formula: `${totalPeriodSeconds} - ${uptimeSeconds} = ${downtimeSeconds} seconds`,
          result: `${this.formatTime(downtimeSeconds)} downtime`
        },
        {
          description: 'Calculate availability ratio',
          formula: `${uptimeSeconds} ÷ ${totalPeriodSeconds}`,
          result: `${availability.toFixed(6)} (${availabilityPercentage.toFixed(4)}%)`
        }
      ],
      results: {
        availability: availability,
        availabilityPercentage: availabilityPercentage,
        downtimeSeconds: downtimeSeconds,
        downtimeFormatted: this.formatTime(downtimeSeconds),
        slaLevel: this.determineSLALevel(availability)
      }
    };

    // Calculate error budget consumption if SLA target provided
    const nearestSLA = this.findNearestSLALevel(availability);
    if (nearestSLA) {
      const errorBudgetUsed = 1 - (availability / nearestSLA.percentage);
      calculation.results.errorBudgetAnalysis = {
        targetSLA: nearestSLA,
        errorBudgetUsed: errorBudgetUsed * 100,
        remainingBudget: (1 - errorBudgetUsed) * 100
      };
    }

    this.logCalculation(calculation);
    return calculation;
  }

  /**
   * Calculate error budget based on SLA target and time period
   * Critical for reliability engineering practices
   */
  calculateErrorBudget(slaTargetPercentage, timePeriodSeconds, currentErrorRate = 0) {
    const slaTarget = slaTargetPercentage / 100;
    const errorBudgetRatio = 1 - slaTarget;
    const totalErrorBudgetSeconds = timePeriodSeconds * errorBudgetRatio;
    
    const calculation = {
      type: 'Error Budget Calculation',
      inputs: {
        slaTargetPercentage,
        timePeriodSeconds,
        currentErrorRate
      },
      steps: [
        {
          description: 'Calculate error budget ratio',
          formula: `1 - (${slaTargetPercentage}% / 100)`,
          result: `${errorBudgetRatio.toFixed(6)} (${(errorBudgetRatio * 100).toFixed(4)}%)`
        },
        {
          description: 'Calculate total error budget',
          formula: `${timePeriodSeconds} seconds × ${errorBudgetRatio.toFixed(6)}`,
          result: `${totalErrorBudgetSeconds.toFixed(0)} seconds (${this.formatTime(totalErrorBudgetSeconds)})`
        }
      ],
      results: {
        errorBudgetRatio: errorBudgetRatio,
        totalErrorBudgetSeconds: totalErrorBudgetSeconds,
        totalErrorBudgetFormatted: this.formatTime(totalErrorBudgetSeconds),
        dailyErrorBudget: this.formatTime((totalErrorBudgetSeconds / timePeriodSeconds) * TIME_PERIODS.DAY),
        weeklyErrorBudget: this.formatTime((totalErrorBudgetSeconds / timePeriodSeconds) * TIME_PERIODS.WEEK)
      }
    };

    // Calculate current error budget consumption if error rate provided
    if (currentErrorRate > 0) {
      const currentErrorSeconds = timePeriodSeconds * (currentErrorRate / 100);
      const budgetConsumed = currentErrorSeconds / totalErrorBudgetSeconds;
      const remainingBudgetSeconds = totalErrorBudgetSeconds - currentErrorSeconds;

      calculation.results.currentConsumption = {
        currentErrorSeconds: currentErrorSeconds,
        budgetConsumed: budgetConsumed * 100,
        remainingBudgetSeconds: remainingBudgetSeconds,
        remainingBudgetFormatted: this.formatTime(Math.max(0, remainingBudgetSeconds)),
        burnRate: this.calculateBurnRate(currentErrorRate, errorBudgetRatio * 100, timePeriodSeconds)
      };

      calculation.steps.push({
        description: 'Calculate current error budget consumption',
        formula: `${currentErrorSeconds.toFixed(0)} seconds / ${totalErrorBudgetSeconds.toFixed(0)} seconds`,
        result: `${(budgetConsumed * 100).toFixed(2)}% consumed`
      });
    }

    this.logCalculation(calculation);
    return calculation;
  }

  /**
   * Calculate burn rate - how quickly error budget is being consumed
   */
  calculateBurnRate(currentErrorRate, errorBudgetPercentage, timePeriodSeconds) {
    const burnRatePerSecond = (currentErrorRate / 100) / (errorBudgetPercentage / 100);
    const timeToExhaustSeconds = (1 / burnRatePerSecond);
    
    return {
      burnRatePerSecond: burnRatePerSecond,
      burnRatePerHour: burnRatePerSecond * 3600,
      timeToExhaustSeconds: timeToExhaustSeconds,
      timeToExhaustFormatted: this.formatTime(timeToExhaustSeconds),
      isCritical: burnRatePerSecond > (1 / (TIME_PERIODS.DAY * 7)) // Will exhaust in less than a week
    };
  }

  // ========================
  // Service Level Indicator (SLI) Calculations
  // ========================

  /**
   * Calculate latency-based SLI (e.g., 95th percentile < 200ms)
   */
  calculateLatencySLI(latencyData, thresholdMs, percentile = 95) {
    const sortedLatencies = [...latencyData].sort((a, b) => a - b);
    const percentileIndex = Math.floor((percentile / 100) * sortedLatencies.length);
    const percentileValue = sortedLatencies[percentileIndex];
    
    const withinThreshold = latencyData.filter(latency => latency <= thresholdMs).length;
    const sliValue = (withinThreshold / latencyData.length) * 100;

    const calculation = {
      type: `Latency SLI (P${percentile} ≤ ${thresholdMs}ms)`,
      inputs: {
        dataPoints: latencyData.length,
        thresholdMs,
        percentile
      },
      results: {
        sliValue: sliValue,
        percentileValue: percentileValue,
        withinThreshold: withinThreshold,
        totalRequests: latencyData.length,
        meetsTarget: percentileValue <= thresholdMs,
        statistics: {
          min: Math.min(...latencyData),
          max: Math.max(...latencyData),
          avg: latencyData.reduce((sum, val) => sum + val, 0) / latencyData.length,
          p50: sortedLatencies[Math.floor(0.5 * sortedLatencies.length)],
          p95: sortedLatencies[Math.floor(0.95 * sortedLatencies.length)],
          p99: sortedLatencies[Math.floor(0.99 * sortedLatencies.length)]
        }
      }
    };

    this.logCalculation(calculation);
    return calculation;
  }

  /**
   * Calculate availability SLI (successful requests / total requests)
   */
  calculateAvailabilitySLI(successfulRequests, totalRequests, timePeriod = 'month') {
    const sliValue = (successfulRequests / totalRequests) * 100;
    const failedRequests = totalRequests - successfulRequests;
    const errorRate = (failedRequests / totalRequests) * 100;

    const calculation = {
      type: `Availability SLI (${timePeriod})`,
      inputs: {
        successfulRequests,
        totalRequests,
        timePeriod
      },
      results: {
        sliValue: sliValue,
        successRate: sliValue,
        errorRate: errorRate,
        failedRequests: failedRequests,
        availabilityLevel: this.determineSLALevel(sliValue / 100),
        meetsCommonTargets: {
          '99.9%': sliValue >= 99.9,
          '99.99%': sliValue >= 99.99,
          '99.999%': sliValue >= 99.999
        }
      }
    };

    this.logCalculation(calculation);
    return calculation;
  }

  /**
   * Calculate throughput SLI (requests per second above threshold)
   */
  calculateThroughputSLI(actualThroughput, targetThroughput, measurementPeriodSeconds) {
    const sliValue = Math.min(100, (actualThroughput / targetThroughput) * 100);
    const throughputDeficit = Math.max(0, targetThroughput - actualThroughput);

    const calculation = {
      type: 'Throughput SLI',
      inputs: {
        actualThroughput,
        targetThroughput,
        measurementPeriodSeconds
      },
      results: {
        sliValue: sliValue,
        meetsTarget: actualThroughput >= targetThroughput,
        throughputDeficit: throughputDeficit,
        totalRequestsProcessed: actualThroughput * measurementPeriodSeconds,
        totalTargetRequests: targetThroughput * measurementPeriodSeconds,
        capacityUtilization: (actualThroughput / targetThroughput) * 100
      }
    };

    this.logCalculation(calculation);
    return calculation;
  }

  // ========================
  // Composite System Reliability
  // ========================

  /**
   * Calculate reliability of systems in series (all must work)
   */
  calculateSeriesReliability(componentReliabilities) {
    const seriesReliability = componentReliabilities.reduce((total, reliability) => {
      return total * (reliability / 100);
    }, 1) * 100;

    const calculation = {
      type: 'Series System Reliability',
      inputs: {
        components: componentReliabilities.length,
        reliabilities: componentReliabilities
      },
      steps: [{
        description: 'Multiply all component reliabilities',
        formula: componentReliabilities.map(r => `${r}%`).join(' × '),
        result: `${seriesReliability.toFixed(4)}%`
      }],
      results: {
        systemReliability: seriesReliability,
        systemAvailability: seriesReliability / 100,
        worstComponent: Math.min(...componentReliabilities),
        reliabilityDrop: Math.min(...componentReliabilities) - seriesReliability,
        recommendedSLA: this.determineSLALevel(seriesReliability / 100)
      }
    };

    // Add insights
    calculation.insights = [
      `Series systems are only as reliable as their weakest component (${Math.min(...componentReliabilities)}%)`,
      `Adding more components reduces overall reliability exponentially`,
      `Each component should target higher reliability than system requirement`
    ];

    this.logCalculation(calculation);
    return calculation;
  }

  /**
   * Calculate reliability of systems in parallel (any can work)
   */
  calculateParallelReliability(componentReliabilities) {
    // Parallel reliability = 1 - (product of all failure probabilities)
    const failureProbabilities = componentReliabilities.map(r => (100 - r) / 100);
    const systemFailureProbability = failureProbabilities.reduce((total, prob) => total * prob, 1);
    const parallelReliability = (1 - systemFailureProbability) * 100;

    const calculation = {
      type: 'Parallel System Reliability',
      inputs: {
        components: componentReliabilities.length,
        reliabilities: componentReliabilities
      },
      steps: [
        {
          description: 'Calculate failure probabilities',
          formula: componentReliabilities.map(r => `(100 - ${r})/100`).join(' × '),
          result: `${systemFailureProbability.toFixed(6)}`
        },
        {
          description: 'Calculate system reliability',
          formula: `1 - ${systemFailureProbability.toFixed(6)}`,
          result: `${parallelReliability.toFixed(4)}%`
        }
      ],
      results: {
        systemReliability: parallelReliability,
        systemAvailability: parallelReliability / 100,
        bestComponent: Math.max(...componentReliabilities),
        reliabilityGain: parallelReliability - Math.max(...componentReliabilities),
        systemFailureProbability: systemFailureProbability * 100,
        recommendedSLA: this.determineSLALevel(parallelReliability / 100)
      }
    };

    // Add insights
    calculation.insights = [
      `Parallel systems are more reliable than any single component`,
      `Adding redundant components improves reliability significantly`,
      `Diminishing returns - first backup gives biggest improvement`
    ];

    this.logCalculation(calculation);
    return calculation;
  }

  // ========================
  // Interview Scenario Calculations
  // ========================

  /**
   * Calculate reliability requirements for a distributed system
   */
  calculateDistributedSystemSLA(services) {
    const calculation = {
      type: 'Distributed System SLA Design',
      inputs: { services },
      serviceAnalysis: [],
      results: {}
    };

    console.log('\n=== Distributed System SLA Analysis ===');

    // Analyze each service
    services.forEach(service => {
      const serviceAnalysis = {
        name: service.name,
        currentReliability: service.reliability,
        criticality: service.criticality,
        dependencies: service.dependencies || [],
        failureImpact: service.failureImpact || 'partial',
        recommendations: []
      };

      // Calculate required reliability based on criticality
      let targetReliability;
      switch (service.criticality) {
        case 'critical':
          targetReliability = 99.99;
          break;
        case 'important':
          targetReliability = 99.9;
          break;
        case 'optional':
          targetReliability = 99.0;
          break;
        default:
          targetReliability = 99.9;
      }

      serviceAnalysis.targetReliability = targetReliability;
      serviceAnalysis.needsImprovement = service.reliability < targetReliability;

      // Generate recommendations
      if (serviceAnalysis.needsImprovement) {
        const reliabilityGap = targetReliability - service.reliability;
        serviceAnalysis.recommendations.push(`Improve reliability by ${reliabilityGap.toFixed(2)}%`);
        
        if (service.criticality === 'critical') {
          serviceAnalysis.recommendations.push('Add redundancy (active-active or active-passive)');
          serviceAnalysis.recommendations.push('Implement circuit breakers and retries');
        }
      }

      calculation.serviceAnalysis.push(serviceAnalysis);

      console.log(`\n${service.name} (${service.criticality}):`);
      console.log(`  Current: ${service.reliability}% | Target: ${targetReliability}%`);
      console.log(`  Status: ${serviceAnalysis.needsImprovement ? '❌ Needs improvement' : '✅ Meets target'}`);
    });

    // Calculate overall system reliability
    const criticalServices = services.filter(s => s.criticality === 'critical');
    if (criticalServices.length > 0) {
      const criticalReliabilities = criticalServices.map(s => s.reliability);
      const systemReliability = this.calculateSeriesReliability(criticalReliabilities);
      calculation.results.systemReliability = systemReliability.results.systemReliability;
    }

    // Generate system-level recommendations
    calculation.results.systemRecommendations = [
      'Implement comprehensive monitoring and alerting',
      'Set up automated failover for critical services',
      'Design graceful degradation for non-critical features',
      'Establish error budgets and SLO burn rate alerts',
      'Regular chaos engineering testing'
    ];

    this.logCalculation(calculation);
    return calculation;
  }

  /**
   * Calculate capacity requirements for SLA compliance
   */
  calculateCapacityForSLA(targetSLA, expectedLoad, loadVariation = 2.0) {
    const slaTarget = targetSLA / 100;
    const errorBudget = 1 - slaTarget;
    
    // Account for load variation and error budget
    const peakLoad = expectedLoad * loadVariation;
    const capacityBuffer = 1.2; // 20% buffer for headroom
    const requiredCapacity = peakLoad * capacityBuffer;
    
    const calculation = {
      type: 'Capacity Planning for SLA Compliance',
      inputs: {
        targetSLA,
        expectedLoad,
        loadVariation,
        capacityBuffer
      },
      steps: [
        {
          description: 'Calculate peak load',
          formula: `${expectedLoad} × ${loadVariation}`,
          result: `${peakLoad} requests/second`
        },
        {
          description: 'Add capacity buffer',
          formula: `${peakLoad} × ${capacityBuffer}`,
          result: `${requiredCapacity} requests/second`
        }
      ],
      results: {
        requiredCapacity: requiredCapacity,
        capacityUtilization: (expectedLoad / requiredCapacity) * 100,
        peakUtilization: (peakLoad / requiredCapacity) * 100,
        headroom: requiredCapacity - peakLoad,
        errorBudgetSeconds: errorBudget * TIME_PERIODS.MONTH,
        recommendedInstances: Math.ceil(requiredCapacity / 1000), // Assuming 1000 RPS per instance
      }
    };

    calculation.insights = [
      `Target utilization should be ~${((expectedLoad / requiredCapacity) * 100).toFixed(0)}% for normal operations`,
      `Peak utilization of ~${((peakLoad / requiredCapacity) * 100).toFixed(0)}% allows for error budget consumption`,
      `${Math.ceil(requiredCapacity / 1000)} instances recommended (assuming 1000 RPS per instance)`,
      `Monitor and alert at 80% capacity to maintain SLA compliance`
    ];

    this.logCalculation(calculation);
    return calculation;
  }

  // ========================
  // Real-World Scenario Examples
  // ========================

  /**
   * Calculate SLA for e-commerce platform
   */
  calculateEcommercePlatformSLA() {
    console.log('\n=== E-commerce Platform SLA Design ===');

    const services = [
      { name: 'User Authentication', reliability: 99.95, criticality: 'critical', failureImpact: 'total' },
      { name: 'Product Catalog', reliability: 99.9, criticality: 'critical', failureImpact: 'total' },
      { name: 'Shopping Cart', reliability: 99.9, criticality: 'critical', failureImpact: 'total' },
      { name: 'Payment Processing', reliability: 99.99, criticality: 'critical', failureImpact: 'total' },
      { name: 'Order Management', reliability: 99.95, criticality: 'critical', failureImpact: 'total' },
      { name: 'Inventory Service', reliability: 99.8, criticality: 'important', failureImpact: 'partial' },
      { name: 'Recommendation Engine', reliability: 99.0, criticality: 'optional', failureImpact: 'none' },
      { name: 'Reviews & Ratings', reliability: 98.5, criticality: 'optional', failureImpact: 'none' }
    ];

    return this.calculateDistributedSystemSLA(services);
  }

  /**
   * Calculate SLA for social media platform
   */
  calculateSocialMediaPlatformSLA() {
    console.log('\n=== Social Media Platform SLA Design ===');

    const services = [
      { name: 'User Authentication', reliability: 99.99, criticality: 'critical', failureImpact: 'total' },
      { name: 'Timeline Generation', reliability: 99.9, criticality: 'critical', failureImpact: 'total' },
      { name: 'Post Publishing', reliability: 99.95, criticality: 'critical', failureImpact: 'partial' },
      { name: 'Media Upload', reliability: 99.8, criticality: 'important', failureImpact: 'partial' },
      { name: 'Search Service', reliability: 99.0, criticality: 'important', failureImpact: 'partial' },
      { name: 'Notifications', reliability: 98.0, criticality: 'optional', failureImpact: 'none' },
      { name: 'Analytics', reliability: 95.0, criticality: 'optional', failureImpact: 'none' }
    ];

    return this.calculateDistributedSystemSLA(services);
  }

  // ========================
  // Utility Methods
  // ========================

  /**
   * Format time duration in human-readable format
   */
  formatTime(seconds) {
    if (seconds < 1) {
      return `${(seconds * 1000).toFixed(1)}ms`;
    } else if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else if (seconds < 3600) {
      return `${(seconds / 60).toFixed(1)}m`;
    } else if (seconds < 86400) {
      return `${(seconds / 3600).toFixed(1)}h`;
    } else if (seconds < 604800) {
      return `${(seconds / 86400).toFixed(1)}d`;
    } else {
      return `${(seconds / 604800).toFixed(1)}w`;
    }
  }

  /**
   * Determine appropriate SLA level based on availability
   */
  determineSLALevel(availability) {
    const percentage = availability * 100;
    
    if (percentage >= 99.999) return '99.999% (Five Nines)';
    if (percentage >= 99.99) return '99.99% (Four Nines)';
    if (percentage >= 99.95) return '99.95%';
    if (percentage >= 99.9) return '99.9% (Three Nines)';
    if (percentage >= 99.0) return '99.0%';
    if (percentage >= 95.0) return '95.0%';
    return 'Below 95%';
  }

  /**
   * Find nearest standard SLA level
   */
  findNearestSLALevel(availability) {
    let nearest = null;
    let minDiff = Infinity;

    Object.entries(AVAILABILITY_LEVELS).forEach(([level, config]) => {
      const diff = Math.abs(availability - config.percentage);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = { level, ...config };
      }
    });

    return nearest;
  }

  /**
   * Log calculation for review and learning
   */
  logCalculation(calculation) {
    calculation.timestamp = new Date().toISOString();
    this.calculations.push(calculation);

    // Keep only last 50 calculations
    if (this.calculations.length > 50) {
      this.calculations = this.calculations.slice(-50);
    }
  }

  /**
   * Generate comprehensive SLA report
   */
  generateSLAReport(calculation) {
    let report = `\n=== ${calculation.type} ===\n`;

    if (calculation.inputs) {
      report += '\n📋 Inputs:\n';
      Object.entries(calculation.inputs).forEach(([key, value]) => {
        report += `  • ${key}: ${value}\n`;
      });
    }

    if (calculation.steps) {
      report += '\n🧮 Calculation Steps:\n';
      calculation.steps.forEach((step, index) => {
        report += `  ${index + 1}. ${step.description}\n`;
        report += `     Formula: ${step.formula}\n`;
        report += `     Result: ${step.result}\n\n`;
      });
    }

    if (calculation.results) {
      report += '📊 Results:\n';
      Object.entries(calculation.results).forEach(([key, value]) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
          report += `  • ${key}:\n`;
          Object.entries(value).forEach(([subKey, subValue]) => {
            report += `    - ${subKey}: ${subValue}\n`;
          });
        } else {
          report += `  • ${key}: ${value}\n`;
        }
      });
    }

    if (calculation.insights) {
      report += '\n💡 Key Insights:\n';
      calculation.insights.forEach(insight => {
        report += `  • ${insight}\n`;
      });
    }

    return report;
  }

  /**
   * Get calculation history
   */
  getCalculationHistory() {
    return this.calculations.map(calc => ({
      type: calc.type,
      timestamp: calc.timestamp,
      hasResults: !!calc.results
    }));
  }

  /**
   * Get quick reference for SLA levels
   */
  getSLAReference() {
    return {
      'Availability Levels': AVAILABILITY_LEVELS,
      'Time Periods': {
        'Hour': '3,600 seconds',
        'Day': '86,400 seconds',
        'Month': '2,629,746 seconds (avg)',
        'Year': '31,556,952 seconds'
      },
      'Common SLAs': {
        'Consumer Services': '99.9% (43.8 min/month)',
        'Business Applications': '99.99% (4.38 min/month)',
        'Mission Critical': '99.999% (26.3 sec/month)'
      },
      'Error Budget Guidelines': {
        '99.9% SLA': '0.1% error budget (43.8 min/month)',
        '99.99% SLA': '0.01% error budget (4.38 min/month)',
        '99.999% SLA': '0.001% error budget (26.3 sec/month)'
      }
    };
  }
}

// ========================
// Usage Examples and Interview Scenarios
// ========================

/**
 * Demonstrate common SLA calculations for interviews
 */
function demonstrateInterviewSLACalculations() {
  console.log('=== SLA Calculator Interview Demonstrations ===');
  
  const calculator = new SLACalculator();
  
  // Example 1: Basic availability calculation
  console.log('\n1. Basic Availability Calculation');
  const uptimeHours = 720; // 30 days * 24 hours - 0.5 hours downtime
  const totalHours = 720; // 30 days * 24 hours
  const availabilityResult = calculator.calculateActualAvailability(
    uptimeHours * 3600, 
    totalHours * 3600
  );
  console.log(calculator.generateSLAReport(availabilityResult));

  // Example 2: Error budget analysis
  console.log('\n2. Error Budget Analysis');
  const errorBudgetResult = calculator.calculateErrorBudget(
    99.99, // 99.99% SLA target
    TIME_PERIODS.MONTH, // Monthly period
    0.005 // Current 0.005% error rate
  );
  console.log(calculator.generateSLAReport(errorBudgetResult));

  // Example 3: System reliability analysis
  console.log('\n3. Series System Reliability');
  const microserviceReliabilities = [99.95, 99.9, 99.85, 99.99]; // Four microservices
  const seriesResult = calculator.calculateSeriesReliability(microserviceReliabilities);
  console.log(calculator.generateSLAReport(seriesResult));

  // Example 4: Redundancy analysis
  console.log('\n4. Parallel System Reliability (with redundancy)');
  const redundantComponents = [99.9, 99.9]; // Two identical components
  const parallelResult = calculator.calculateParallelReliability(redundantComponents);
  console.log(calculator.generateSLAReport(parallelResult));

  // Example 5: Capacity planning
  console.log('\n5. Capacity Planning for SLA');
  const capacityResult = calculator.calculateCapacityForSLA(
    99.99, // Target 99.99% SLA
    5000,  // Expected 5000 RPS
    3.0    // 3x load variation during peak
  );
  console.log(calculator.generateSLAReport(capacityResult));
}

/**
 * Practice interview problems
 */
function practiceInterviewSLAProblems() {
  console.log('\n=== Practice Interview SLA Problems ===');
  
  const calculator = new SLACalculator();
  
  const problems = [
    {
      title: "Design SLA for Netflix-scale Video Streaming",
      scenario: "Video streaming service with 200M users, 99.99% availability target",
      solution: () => {
        const services = [
          { name: 'User Auth', reliability: 99.99, criticality: 'critical' },
          { name: 'Video Catalog', reliability: 99.95, criticality: 'critical' },
          { name: 'Video Streaming', reliability: 99.9, criticality: 'critical' },
          { name: 'CDN', reliability: 99.99, criticality: 'critical' },
          { name: 'Recommendations', reliability: 99.0, criticality: 'optional' }
        ];
        return calculator.calculateDistributedSystemSLA(services);
      }
    },
    {
      title: "Calculate Error Budget for Payment System",
      scenario: "99.999% SLA payment system processing 1M transactions/month",
      solution: () => {
        return calculator.calculateErrorBudget(99.999, TIME_PERIODS.MONTH, 0);
      }
    },
    {
      title: "Database Redundancy Planning",
      scenario: "Design database redundancy for 99.99% availability with 99.9% individual DB reliability",
      solution: () => {
        // Show that you need 3 databases in parallel to exceed 99.99%
        const singleDB = calculator.calculateParallelReliability([99.9]);
        const dualDB = calculator.calculateParallelReliability([99.9, 99.9]);
        const tripleDB = calculator.calculateParallelReliability([99.9, 99.9, 99.9]);
        
        return { singleDB, dualDB, tripleDB };
      }
    }
  ];

  problems.forEach((problem, index) => {
    console.log(`\n📝 Problem ${index + 1}: ${problem.title}`);
    console.log(`Scenario: ${problem.scenario}`);
    console.log('\nSolution:');
    
    const solution = problem.solution();
    if (solution.results) {
      console.log(calculator.generateSLAReport(solution));
    } else {
      Object.entries(solution).forEach(([key, result]) => {
        if (result.results) {
          console.log(`\n${key}:`, result.results);
        }
      });
    }
  });
}

/**
 * Show real-world SLA examples from major companies
 */
function showRealWorldSLAExamples() {
  console.log('\n=== Real-World SLA Examples ===');
  
  const examples = {
    'AWS EC2': {
      sla: 99.99,
      description: 'Amazon EC2 Instance uptime SLA',
      downtime: '4.38 minutes per month',
      compensation: 'Service credits for SLA miss'
    },
    'Google Cloud Platform': {
      sla: 99.95,
      description: 'GCP Compute Engine uptime SLA',
      downtime: '21.9 minutes per month',
      compensation: '10-25% service credits'
    },
    'Microsoft Azure': {
      sla: 99.9,
      description: 'Azure Virtual Machines SLA',
      downtime: '43.8 minutes per month',
      compensation: 'Service credits based on downtime'
    },
    'Netflix': {
      sla: 99.97,
      description: 'Video streaming availability (estimated)',
      downtime: '13.1 minutes per month',
      notes: 'Actual internal target may be higher'
    },
    'Stripe Payments': {
      sla: 99.99,
      description: 'Payment processing uptime',
      downtime: '4.38 minutes per month',
      notes: 'Critical for merchant revenue'
    }
  };

  Object.entries(examples).forEach(([service, sla]) => {
    console.log(`\n${service}:`);
    console.log(`  SLA: ${sla.sla}%`);
    console.log(`  Downtime: ${sla.downtime}`);
    console.log(`  Description: ${sla.description}`);
    if (sla.compensation) {
      console.log(`  Compensation: ${sla.compensation}`);
    }
    if (sla.notes) {
      console.log(`  Notes: ${sla.notes}`);
    }
  });
}

// Export for use in other modules
module.exports = { 
  SLACalculator,
  AVAILABILITY_LEVELS,
  TIME_PERIODS,
  SLI_TYPES,
  demonstrateInterviewSLACalculations,
  practiceInterviewSLAProblems,
  showRealWorldSLAExamples
};

// Run demonstrations if this file is executed directly
if (require.main === module) {
  demonstrateInterviewSLACalculations();
  practiceInterviewSLAProblems();
  showRealWorldSLAExamples();
}