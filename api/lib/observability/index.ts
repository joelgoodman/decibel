import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { metrics } from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { logger } from '../logger';

// Initialize OpenTelemetry
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'decibel-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '0.0.1',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development'
  }),
  spanProcessor: new SimpleSpanProcessor(new JaegerExporter()),
});

// Initialize Prometheus metrics
const prometheusExporter = new PrometheusExporter({
  port: 9464,
  startServer: true
});

const meterProvider = new MeterProvider();
meterProvider.addMetricReader(prometheusExporter);
metrics.setGlobalMeterProvider(meterProvider);

// Create meters for different metric types
const meter = metrics.getMeter('decibel-metrics');

// Request metrics
export const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests'
});

export const requestDuration = meter.createHistogram('http_request_duration_ms', {
  description: 'HTTP request duration in milliseconds'
});

// Database metrics
export const dbQueryCounter = meter.createCounter('db_queries_total', {
  description: 'Total number of database queries'
});

export const dbQueryDuration = meter.createHistogram('db_query_duration_ms', {
  description: 'Database query duration in milliseconds'
});

// Cache metrics
export const cacheHits = meter.createCounter('cache_hits_total', {
  description: 'Total number of cache hits'
});

export const cacheMisses = meter.createCounter('cache_misses_total', {
  description: 'Total number of cache misses'
});

// System metrics
export const systemMemory = meter.createUpDownCounter('system_memory_usage_bytes', {
  description: 'System memory usage in bytes'
});

export const systemCpu = meter.createUpDownCounter('system_cpu_usage_percent', {
  description: 'System CPU usage percentage'
});

// Initialize observability
export async function initializeObservability() {
  try {
    await sdk.start();
    logger.info('OpenTelemetry initialized successfully');

    // Start collecting system metrics
    startSystemMetricsCollection();

    return true;
  } catch (error) {
    logger.error('Failed to initialize observability:', error);
    return false;
  }
}

// Collect system metrics every 15 seconds
function startSystemMetricsCollection() {
  setInterval(() => {
    const used = process.memoryUsage();
    systemMemory.add(used.heapUsed);

    const cpuUsage = process.cpuUsage();
    const totalCpuTime = cpuUsage.user + cpuUsage.system;
    const cpuPercent = (totalCpuTime / 1000000) * 100; // Convert to percentage
    systemCpu.add(cpuPercent);
  }, 15000);
}