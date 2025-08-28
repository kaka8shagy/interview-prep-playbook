/**
 * File: webpack-rollup-basics.js
 * Description: Basic concepts of Webpack and Rollup bundlers for JavaScript modules
 * Covers configuration patterns, plugins, optimization strategies, and use cases
 */

console.log('=== Webpack and Rollup Bundler Basics ===');

// Example 1: Webpack Configuration Concepts
console.log('1. Webpack Configuration Concepts:');

class WebpackConfigBuilder {
  constructor() {
    this.config = {
      entry: './src/index.js',
      output: {
        path: '/dist',
        filename: 'bundle.js'
      },
      mode: 'development',
      module: {
        rules: []
      },
      plugins: [],
      optimization: {},
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: {}
      }
    };
  }

  setEntry(entry) {
    if (typeof entry === 'string') {
      this.config.entry = entry;
    } else if (typeof entry === 'object') {
      // Multiple entry points
      this.config.entry = entry;
    }
    return this;
  }

  setOutput(output) {
    this.config.output = { ...this.config.output, ...output };
    return this;
  }

  addLoader(test, use, options = {}) {
    this.config.module.rules.push({
      test,
      use,
      ...options
    });
    return this;
  }

  addPlugin(plugin) {
    this.config.plugins.push(plugin);
    return this;
  }

  setOptimization(optimization) {
    this.config.optimization = { ...this.config.optimization, ...optimization };
    return this;
  }

  setMode(mode) {
    this.config.mode = mode;
    return this;
  }

  addAlias(name, path) {
    this.config.resolve.alias[name] = path;
    return this;
  }

  build() {
    return { ...this.config };
  }

  // Common configuration patterns
  forDevelopment() {
    return this
      .setMode('development')
      .setOutput({
        filename: '[name].js',
        publicPath: '/'
      })
      .addPlugin(new MockHotModuleReplacementPlugin());
  }

  forProduction() {
    return this
      .setMode('production')
      .setOutput({
        filename: '[name].[contenthash].js',
        clean: true
      })
      .setOptimization({
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all'
            }
          }
        }
      });
  }

  forLibrary(libraryName) {
    return this
      .setOutput({
        filename: `${libraryName}.js`,
        library: libraryName,
        libraryTarget: 'umd',
        globalObject: 'this'
      })
      .setOptimization({
        minimize: false
      });
  }
}

// Mock plugin classes for demonstration
class MockHotModuleReplacementPlugin {
  constructor() {
    this.name = 'HotModuleReplacementPlugin';
  }
}

class MockMiniCssExtractPlugin {
  constructor(options = {}) {
    this.name = 'MiniCssExtractPlugin';
    this.options = options;
  }
}

// Example configurations
console.log('Basic webpack configuration patterns:');

const basicConfig = new WebpackConfigBuilder()
  .setEntry('./src/app.js')
  .setOutput({ filename: 'app.bundle.js' })
  .addLoader(/\.js$/, 'babel-loader', { exclude: /node_modules/ })
  .addLoader(/\.css$/, ['style-loader', 'css-loader'])
  .build();

console.log('Basic config:', JSON.stringify(basicConfig, null, 2));

const prodConfig = new WebpackConfigBuilder()
  .forProduction()
  .addLoader(/\.tsx?$/, 'ts-loader')
  .addAlias('@', './src')
  .build();

console.log('\nProduction config structure:', Object.keys(prodConfig));

// Example 2: Rollup Configuration Concepts
console.log('\n2. Rollup Configuration Concepts:');

class RollupConfigBuilder {
  constructor() {
    this.config = {
      input: 'src/index.js',
      output: {
        file: 'dist/bundle.js',
        format: 'iife'
      },
      plugins: [],
      external: []
    };
  }

  setInput(input) {
    this.config.input = input;
    return this;
  }

  setOutput(output) {
    if (Array.isArray(output)) {
      this.config.output = output;
    } else {
      this.config.output = { ...this.config.output, ...output };
    }
    return this;
  }

  addPlugin(plugin) {
    this.config.plugins.push(plugin);
    return this;
  }

  addExternal(external) {
    if (Array.isArray(external)) {
      this.config.external.push(...external);
    } else {
      this.config.external.push(external);
    }
    return this;
  }

  // Multiple output formats
  forMultipleFormats(name) {
    this.config.output = [
      {
        file: `dist/${name}.cjs.js`,
        format: 'cjs'
      },
      {
        file: `dist/${name}.esm.js`,
        format: 'es'
      },
      {
        file: `dist/${name}.umd.js`,
        format: 'umd',
        name: name
      },
      {
        file: `dist/${name}.iife.js`,
        format: 'iife',
        name: name
      }
    ];
    return this;
  }

  forLibrary(libraryName) {
    return this
      .forMultipleFormats(libraryName)
      .addExternal(['react', 'react-dom']);
  }

  forApplication() {
    return this
      .setOutput({
        file: 'dist/app.js',
        format: 'iife'
      });
  }

  build() {
    return { ...this.config };
  }
}

// Mock Rollup plugins
class MockResolvePlugin {
  constructor(options = {}) {
    this.name = 'resolve';
    this.options = options;
  }
}

class MockCommonJSPlugin {
  constructor() {
    this.name = 'commonjs';
  }
}

class MockBabelPlugin {
  constructor(options = {}) {
    this.name = 'babel';
    this.options = options;
  }
}

class MockTerserPlugin {
  constructor() {
    this.name = 'terser';
  }
}

console.log('Rollup configuration patterns:');

const rollupLibConfig = new RollupConfigBuilder()
  .forLibrary('MyLibrary')
  .addPlugin(new MockResolvePlugin({ browser: true }))
  .addPlugin(new MockCommonJSPlugin())
  .addPlugin(new MockBabelPlugin())
  .build();

console.log('Library config outputs:', rollupLibConfig.output.map(o => o.format));

const rollupAppConfig = new RollupConfigBuilder()
  .forApplication()
  .addPlugin(new MockResolvePlugin())
  .addPlugin(new MockTerserPlugin())
  .build();

console.log('App config format:', rollupAppConfig.output.format);

// Example 3: Bundling Process Simulation
console.log('\n3. Bundling Process Simulation:');

class BundlerSimulator {
  constructor(type = 'webpack') {
    this.type = type;
    this.modules = new Map();
    this.dependencies = new Map();
    this.chunks = [];
  }

  addModule(path, content, deps = []) {
    this.modules.set(path, {
      path,
      content,
      dependencies: deps
    });
    this.dependencies.set(path, deps);
  }

  buildDependencyGraph() {
    console.log(`Building dependency graph (${this.type} style):`);
    
    const visited = new Set();
    const graph = {};

    const traverse = (modulePath, depth = 0) => {
      if (visited.has(modulePath)) return;
      visited.add(modulePath);

      const indent = '  '.repeat(depth);
      console.log(`${indent}${modulePath}`);

      const deps = this.dependencies.get(modulePath) || [];
      graph[modulePath] = deps;

      deps.forEach(dep => traverse(dep, depth + 1));
    };

    // Start from entry point
    const entryPoints = Array.from(this.modules.keys()).filter(
      path => !Array.from(this.dependencies.values()).flat().includes(path)
    );

    entryPoints.forEach(entry => traverse(entry));
    return graph;
  }

  performTreeShaking() {
    console.log('\nPerforming tree shaking:');
    
    const usedExports = new Set();
    
    // Simulate analyzing which exports are actually used
    this.modules.forEach((module, path) => {
      const mockExports = this.extractExports(module.content);
      const usedInModule = mockExports.filter(exp => 
        Math.random() > 0.3 // Randomly simulate usage
      );
      
      usedInModule.forEach(exp => usedExports.add(`${path}:${exp}`));
    });

    console.log('Used exports:', Array.from(usedExports));
    return usedExports;
  }

  extractExports(content) {
    // Mock export extraction
    const exports = [];
    if (content.includes('export default')) exports.push('default');
    if (content.includes('export function')) exports.push('function');
    if (content.includes('export const')) exports.push('const');
    return exports;
  }

  generateChunks() {
    console.log('\nGenerating chunks:');
    
    if (this.type === 'webpack') {
      return this.webpackChunking();
    } else {
      return this.rollupChunking();
    }
  }

  webpackChunking() {
    // Webpack creates chunks based on split points
    const chunks = [
      {
        name: 'main',
        modules: Array.from(this.modules.keys()).slice(0, 3),
        type: 'entry'
      },
      {
        name: 'vendor',
        modules: Array.from(this.modules.keys()).filter(m => 
          m.includes('node_modules')
        ),
        type: 'vendor'
      },
      {
        name: 'runtime',
        modules: ['webpack/runtime'],
        type: 'runtime'
      }
    ];

    chunks.forEach(chunk => {
      console.log(`  Chunk "${chunk.name}" (${chunk.type}): ${chunk.modules.length} modules`);
    });

    return chunks;
  }

  rollupChunking() {
    // Rollup typically creates fewer, more optimized chunks
    const chunks = [
      {
        name: 'bundle',
        modules: Array.from(this.modules.keys()),
        type: 'single'
      }
    ];

    chunks.forEach(chunk => {
      console.log(`  Single bundle: ${chunk.modules.length} modules`);
    });

    return chunks;
  }

  simulate() {
    console.log(`\n=== ${this.type.toUpperCase()} Bundling Simulation ===`);
    
    const graph = this.buildDependencyGraph();
    const usedExports = this.performTreeShaking();
    const chunks = this.generateChunks();
    
    return {
      dependencyGraph: graph,
      usedExports: Array.from(usedExports),
      chunks
    };
  }
}

// Test bundler simulations
const webpackSim = new BundlerSimulator('webpack');
webpackSim.addModule('./src/index.js', 'import "./app.js"; export default app;', ['./app.js']);
webpackSim.addModule('./src/app.js', 'import utils from "./utils"; export default app;', ['./utils.js']);
webpackSim.addModule('./src/utils.js', 'export const helper = () => {}; export default utils;', []);
webpackSim.addModule('./node_modules/lodash/index.js', 'export default lodash;', []);

const rollupSim = new BundlerSimulator('rollup');
rollupSim.addModule('./src/index.js', 'import "./app.js"; export default app;', ['./app.js']);
rollupSim.addModule('./src/app.js', 'import utils from "./utils"; export default app;', ['./utils.js']);
rollupSim.addModule('./src/utils.js', 'export const helper = () => {}; export default utils;', []);

webpackSim.simulate();
rollupSim.simulate();

// Example 4: Plugin System Concepts
console.log('\n4. Plugin System Concepts:');

class WebpackPluginSimulator {
  constructor() {
    this.hooks = new Map();
    this.plugins = [];
  }

  // Simulate webpack's hook system
  createHook(name) {
    this.hooks.set(name, []);
  }

  addPlugin(plugin) {
    this.plugins.push(plugin);
    
    // Let plugin register to hooks
    if (plugin.apply) {
      plugin.apply(this);
    }
  }

  tap(hookName, callback) {
    if (this.hooks.has(hookName)) {
      this.hooks.get(hookName).push(callback);
    }
  }

  call(hookName, ...args) {
    if (this.hooks.has(hookName)) {
      this.hooks.get(hookName).forEach(callback => {
        callback(...args);
      });
    }
  }

  compile() {
    console.log('Webpack compilation process:');
    
    // Create hooks
    this.createHook('beforeCompile');
    this.createHook('compile');
    this.createHook('afterCompile');
    this.createHook('emit');
    
    // Apply plugins
    this.plugins.forEach(plugin => {
      if (plugin.apply) plugin.apply(this);
    });

    // Simulation compilation phases
    console.log('  Phase 1: Before compile');
    this.call('beforeCompile');
    
    console.log('  Phase 2: Compile');
    this.call('compile');
    
    console.log('  Phase 3: After compile');
    this.call('afterCompile');
    
    console.log('  Phase 4: Emit');
    this.call('emit');
    
    console.log('  Compilation complete');
  }
}

// Mock webpack plugins
class MockDefinePlugin {
  constructor(definitions) {
    this.definitions = definitions;
  }
  
  apply(compiler) {
    compiler.tap('compile', () => {
      console.log('    DefinePlugin: Injecting definitions', Object.keys(this.definitions));
    });
  }
}

class MockHtmlWebpackPlugin {
  constructor(options) {
    this.options = options;
  }
  
  apply(compiler) {
    compiler.tap('emit', () => {
      console.log('    HtmlWebpackPlugin: Generating HTML file');
    });
  }
}

// Test webpack plugin system
const webpackCompiler = new WebpackPluginSimulator();
webpackCompiler.addPlugin(new MockDefinePlugin({ 'process.env.NODE_ENV': 'production' }));
webpackCompiler.addPlugin(new MockHtmlWebpackPlugin({ template: 'index.html' }));
webpackCompiler.compile();

// Example 5: Rollup Plugin System
console.log('\n5. Rollup Plugin System:');

class RollupPluginSimulator {
  constructor() {
    this.plugins = [];
  }

  addPlugin(plugin) {
    this.plugins.push(plugin);
  }

  async build() {
    console.log('Rollup build process:');
    
    const context = {
      moduleIds: ['./src/index.js', './src/utils.js'],
      modules: new Map()
    };

    // Build hooks
    await this.runHook('buildStart', context);
    
    for (const moduleId of context.moduleIds) {
      await this.runHook('resolveId', moduleId, context);
      await this.runHook('load', moduleId, context);
      await this.runHook('transform', moduleId, context);
    }
    
    await this.runHook('generateBundle', context);
    await this.runHook('writeBundle', context);
    
    console.log('  Build complete');
  }

  async runHook(hookName, ...args) {
    console.log(`  Hook: ${hookName}`);
    
    for (const plugin of this.plugins) {
      if (plugin[hookName]) {
        await plugin[hookName](...args);
      }
    }
  }
}

// Mock Rollup plugins
const mockResolvePlugin = {
  name: 'resolve',
  resolveId(id) {
    console.log(`    Resolve plugin: resolving ${id}`);
    return id;
  }
};

const mockTransformPlugin = {
  name: 'transform',
  transform(code, id) {
    console.log(`    Transform plugin: transforming ${id}`);
    return { code: code + '// transformed', map: null };
  }
};

// Test Rollup plugin system
const rollupBuilder = new RollupPluginSimulator();
rollupBuilder.addPlugin(mockResolvePlugin);
rollupBuilder.addPlugin(mockTransformPlugin);
rollupBuilder.build();

// Example 6: Optimization Strategies
console.log('\n6. Optimization Strategies:');

class OptimizationAnalyzer {
  analyzeWebpackOptimizations() {
    return {
      codeOptimizations: [
        'Minification with TerserPlugin',
        'Dead code elimination',
        'Scope hoisting',
        'Module concatenation'
      ],
      bundleOptimizations: [
        'Code splitting with SplitChunksPlugin',
        'Dynamic imports for lazy loading',
        'Vendor chunk separation',
        'Commons chunk extraction'
      ],
      assetOptimizations: [
        'CSS extraction with MiniCssExtractPlugin',
        'Image optimization',
        'File compression (gzip/brotli)',
        'Asset hashing for caching'
      ],
      performanceOptimizations: [
        'Tree shaking configuration',
        'Source map optimization',
        'Bundle analysis',
        'Memory usage optimization'
      ]
    };
  }

  analyzeRollupOptimizations() {
    return {
      codeOptimizations: [
        'Superior tree shaking',
        'Smaller bundle size',
        'ES module output',
        'Dead code elimination'
      ],
      bundleOptimizations: [
        'Code splitting (limited)',
        'Multiple output formats',
        'External dependency handling',
        'Plugin-based chunking'
      ],
      assetOptimizations: [
        'Plugin-based asset processing',
        'CSS handling through plugins',
        'File copying plugins',
        'Hash-based naming'
      ],
      performanceOptimizations: [
        'Fast build times',
        'Efficient tree shaking',
        'Minimal runtime overhead',
        'Better for libraries'
      ]
    };
  }

  compare() {
    const webpack = this.analyzeWebpackOptimizations();
    const rollup = this.analyzeRollupOptimizations();

    console.log('Webpack optimizations:');
    Object.entries(webpack).forEach(([category, optimizations]) => {
      console.log(`  ${category}:`);
      optimizations.slice(0, 2).forEach(opt => {
        console.log(`    - ${opt}`);
      });
    });

    console.log('\nRollup optimizations:');
    Object.entries(rollup).forEach(([category, optimizations]) => {
      console.log(`  ${category}:`);
      optimizations.slice(0, 2).forEach(opt => {
        console.log(`    - ${opt}`);
      });
    });
  }

  recommendBundler(projectType) {
    const recommendations = {
      'spa': {
        bundler: 'Webpack',
        reason: 'Better code splitting and hot reloading',
        config: 'Complex but feature-rich'
      },
      'library': {
        bundler: 'Rollup',
        reason: 'Superior tree shaking and smaller bundles',
        config: 'Simpler, focused on bundling'
      },
      'node-app': {
        bundler: 'Webpack',
        reason: 'Better Node.js support and plugins',
        config: 'Good for SSR and server bundling'
      },
      'component-library': {
        bundler: 'Rollup',
        reason: 'Multiple output formats and clean bundles',
        config: 'Ideal for distributing libraries'
      }
    };

    const recommendation = recommendations[projectType];
    if (recommendation) {
      console.log(`\nRecommendation for ${projectType}:`);
      console.log(`  Bundler: ${recommendation.bundler}`);
      console.log(`  Reason: ${recommendation.reason}`);
      console.log(`  Config: ${recommendation.config}`);
    }

    return recommendation;
  }
}

const optimizer = new OptimizationAnalyzer();
optimizer.compare();
optimizer.recommendBundler('library');
optimizer.recommendBundler('spa');

module.exports = {
  WebpackConfigBuilder,
  RollupConfigBuilder,
  BundlerSimulator,
  WebpackPluginSimulator,
  RollupPluginSimulator,
  OptimizationAnalyzer
};