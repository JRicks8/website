/**
 * Microbenchmark: multiply-by-scale vs if for zeroing dt / adjInterval when paused.
 * Run: node scripts/bench-tick-pause-style.mjs
 */

const ITERATIONS = 50_000_000;
const now = 1000;
const last = 0;
const interval = 16;

/** Toggle paused each iteration so branch prediction does not trivially favor one path. */
function benchArithmetic(iterations) {
  let sink = 0;
  const t0 = performance.now();
  for (let i = 0; i < iterations; i++) {
    const paused = (i & 1) === 0;
    const scale = Number(!paused);
    const dt = (now - last) * scale;
    const adjInterval = interval * scale;
    sink += dt + adjInterval;
  }
  return { ms: performance.now() - t0, sink };
}

function benchIf(iterations) {
  let sink = 0;
  const t0 = performance.now();
  for (let i = 0; i < iterations; i++) {
    const paused = (i & 1) === 0;
    let dt = now - last;
    let adjInterval = interval;
    if (paused) {
      dt = 0;
      adjInterval = 0;
    }
    sink += dt + adjInterval;
  }
  return { ms: performance.now() - t0, sink };
}

function main() {
  // Warmup
  benchArithmetic(100_000);
  benchIf(100_000);

  const a = benchArithmetic(ITERATIONS);
  const b = benchIf(ITERATIONS);

  if (a.sink !== b.sink) {
    console.error("Sink mismatch (logic bug):", a.sink, b.sink);
    process.exit(1);
  }

  const faster = a.ms <= b.ms ? "arithmetic (Number(!paused) * …)" : "if (paused) { … }";
  const ratio = a.ms / b.ms;

  console.log(`Iterations: ${ITERATIONS.toLocaleString()}`);
  console.log(`Arithmetic: ${a.ms.toFixed(2)} ms`);
  console.log(`If:         ${b.ms.toFixed(2)} ms`);
  console.log(`Ratio (arith / if): ${ratio.toFixed(4)}`);
  console.log(`Faster this run: ${faster}`);
  console.log(
    "\nNote: Differences are often within noise / CPU governor. Run several times; for rAF-scale work, neither matters."
  );
}

main();
