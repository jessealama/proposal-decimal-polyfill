#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const ITERATIONS = 5;
const RESULTS_DIR = "./benchmark-results";

// Ensure results directory exists
if (!existsSync(RESULTS_DIR)) {
    mkdirSync(RESULTS_DIR, { recursive: true });
}

function getCurrentBranch() {
    return execSync("git branch --show-current").toString().trim();
}

function runBenchmark(branch, iterations = ITERATIONS) {
    console.log(`\nBenchmarking branch: ${branch}`);
    console.log("=".repeat(50));

    // Switch to branch
    execSync(`git checkout ${branch}`, { stdio: "inherit" });

    // Clean install dependencies
    console.log("Installing dependencies...");
    execSync("npm ci", { stdio: "inherit" });

    // Compile TypeScript
    console.log("Compiling TypeScript...");
    execSync("npx tsc", { stdio: "inherit" });

    const times = [];

    for (let i = 1; i <= iterations; i++) {
        console.log(`\nRunning iteration ${i}/${iterations}...`);

        const startTime = Date.now();
        try {
            execSync(
                "npm test -- --testPathIgnorePatterns='Decimal/constructor\\.test\\.js'",
                { stdio: "pipe" }
            );
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000; // Convert to seconds
            times.push(duration);
            console.log(`Iteration ${i} completed in ${duration.toFixed(2)}s`);
        } catch (error) {
            console.error(`Test failed on iteration ${i}`);
            throw error;
        }
    }

    return times;
}

function calculateStats(times) {
    const sum = times.reduce((a, b) => a + b, 0);
    const avg = sum / times.length;
    const sorted = [...times].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = Math.min(...times);
    const max = Math.max(...times);

    // Calculate standard deviation
    const squaredDiffs = times.map((time) => Math.pow(time - avg, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / times.length;
    const stdDev = Math.sqrt(variance);

    return { avg, median, min, max, stdDev, times };
}

function formatResults(branch, stats) {
    return `
Branch: ${branch}
-----------------
Average: ${stats.avg.toFixed(2)}s
Median: ${stats.median.toFixed(2)}s
Min: ${stats.min.toFixed(2)}s
Max: ${stats.max.toFixed(2)}s
Std Dev: ${stats.stdDev.toFixed(2)}s
All times: ${stats.times.map((t) => t.toFixed(2) + "s").join(", ")}
`;
}

async function main() {
    const currentBranch = getCurrentBranch();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    try {
        // Benchmark main branch
        const mainStats = calculateStats(runBenchmark("main"));

        // Benchmark current branch
        const currentStats = calculateStats(runBenchmark(currentBranch));

        // Calculate improvement
        const improvement =
            ((mainStats.avg - currentStats.avg) / mainStats.avg) * 100;
        const faster = improvement > 0;

        // Generate report
        const report = `
Test Suite Performance Benchmark (Excluding Constructor Tests)
==============================================================
Date: ${new Date().toISOString()}
Iterations: ${ITERATIONS}
Excluded: Decimal/constructor.test.js

${formatResults("main", mainStats)}
${formatResults(currentBranch, currentStats)}

COMPARISON
----------
Average time difference: ${Math.abs(mainStats.avg - currentStats.avg).toFixed(2)}s
Performance change: ${faster ? "+" : ""}${improvement.toFixed(1)}% ${faster ? "faster" : "slower"}
Median difference: ${(mainStats.median - currentStats.median).toFixed(2)}s

CONCLUSION
----------
The ${currentBranch} branch is ${faster ? "FASTER" : "SLOWER"} than main by ${Math.abs(improvement).toFixed(1)}%.
${Math.abs(improvement) < 5 ? "This is a relatively minor difference." : "This is a significant difference."}
`;

        console.log(report);

        // Save report
        const reportPath = `${RESULTS_DIR}/benchmark-${timestamp}.txt`;
        writeFileSync(reportPath, report);
        console.log(`\nReport saved to: ${reportPath}`);
    } finally {
        // Return to original branch
        execSync(`git checkout ${currentBranch}`, { stdio: "inherit" });
    }
}

main().catch((error) => {
    console.error("Benchmark failed:", error);
    process.exit(1);
});
