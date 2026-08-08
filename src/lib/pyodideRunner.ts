import type { TestCaseResult } from './interviewState';

declare global {
  interface Window {
    loadPyodide?: (config?: { indexURL?: string }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: {
    get: (name: string) => unknown;
  };
}

let pyodideInstance: PyodideInterface | null = null;
let loadingPromise: Promise<void> | null = null;

function loadPyodideScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.loadPyodide) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pyodide script from CDN'));
    document.body.appendChild(script);
  });
}

export async function loadPyodideRuntime(): Promise<void> {
  if (pyodideInstance) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      await loadPyodideScript();
      if (typeof window === 'undefined' || !window.loadPyodide) {
        throw new Error('Pyodide script not loaded');
      }
      pyodideInstance = await window.loadPyodide();
    } catch (err) {
      loadingPromise = null;
      throw err;
    }
  })();

  return loadingPromise;
}

export function isPyodideReady(): boolean {
  return pyodideInstance !== null;
}

export async function runTestCases(
  functionName: string,
  code: string,
  testCases: { input: string; output: string }[]
): Promise<TestCaseResult[]> {
  if (!pyodideInstance) {
    throw new Error('Pyodide not loaded. Call loadPyodideRuntime() first.');
  }

  const results: TestCaseResult[] = [];

  for (const testCase of testCases) {
    const harness = `
${code}

import json
try:
    __result = ${functionName}(${extractCallArgs(testCase.input, functionName)})
    __output = json.dumps(sorted(__result) if isinstance(__result, set) else __result)
    __error = None
except Exception as __e:
    __output = None
    __error = str(__e)
`;

    try {
      await pyodideInstance.runPythonAsync(harness);
      const output = await pyodideInstance.runPythonAsync('__output');
      const error = await pyodideInstance.runPythonAsync('__error');

      if (error) {
        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: '',
          passed: false,
          error: String(error),
        });
      } else {
        const actualOutput = String(output);
        const normalizedExpected = normalizeForComparison(testCase.output);
        const normalizedActual = normalizeForComparison(actualOutput);
        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput,
          passed: normalizedActual === normalizedExpected,
        });
      }
    } catch (err) {
      results.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: '',
        passed: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

function extractCallArgs(input: string, functionName: string): string {
  // Problem testCases store input like "nums = [2, 7, 11, 15], target = 9"
  // or "[1, 2, 3, 2, 1, 4]" (positional). Both are valid Python call-argument
  // fragments once wrapped in parens, since named args ("nums=...") and bare
  // literals are both legal inside a call's argument list.
  return input;
}

function normalizeForComparison(value: string): string {
  // Compare via parsed JSON/Python-literal shape where possible so that
  // [0, 1] and [0,1] compare equal; fall back to trimmed string compare.
  try {
    const parsed = JSON.parse(value.replace(/'/g, '"'));
    if (Array.isArray(parsed)) {
      const sorted = [...parsed].sort();
      return JSON.stringify(sorted);
    }
    return JSON.stringify(parsed);
  } catch {
    return value.trim();
  }
}
