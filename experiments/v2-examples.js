/**
 * SLaNg v2 — Upgrade Examples & Feature Demonstrations
 * 
 * Run with: node --input-type=module < experiments/v2-examples.js
 */

// ─── Import from new modules ──────────────────────────────────────────────────
import {
    // Symbolic
    symVar, symConst, symFn, symAdd, symMul, symDiv, symPow,
    sin, cos, tan, ln, exp, sqrt, asin, atan,
    symDiff, symIntegrate, symNthDiff, symSimplify,
    symToLatex, symEval, symTaylorSeries, symNumericalIntegrate,
    slangToSym, PI, E
} from '../slang-symbolic.js';

import {
    euler, rk4, rk45, rk4System,
    solveODE, solveSystem, solveSecondOrder,
    solveDampedHarmonic, solveLogistic, solveLorenz,
    phasePortrait, findEquilibria, analyzeSolution, interpolateSolution
} from '../slang-ode.js';

import {
    zeros, eye, matAdd, matMul, matT, solve, inv, det, trace,
    luDecomp, qrDecomp, eigenvalues, dominantEigen,
    jacobian, hessian, numericalGrad,
    normFrob, conditionNumber,
    newtonRaphson, gradientDescent,
    matToString, vecToString, dot, cross, norm, normalize
} from '../slang-linalg.js';

import {
    describe, linearRegression, polyRegression,
    normalPDF, normalCDF, normalInvCDF,
    tTest, tTest2, chiSqTest,
    moment, expectedValue, variance, entropy,
    monteCarloIntegrate, mcSample,
    poissonPMF, binomialPMF,
    exponentialCDF
} from '../slang-stats.js';

import {
    C, I, ONE, ZERO,
    cAdd, cSub, cMul, cDiv, cPow, cSqrt, cExp, cLog,
    cSin, cCos, cAbs, cArg, toPolar, fromPolar,
    polyRoots, fft, ifft, realFFT,
    contourIntegral, circleIntegral, residue,
    cToString, cToLatex
} from '../slang-complex.js';

// ─── Logging helpers ──────────────────────────────────────────────────────────
const hr = () => console.log('═'.repeat(65));
const h2 = label => { console.log(); hr(); console.log(`  ${label}`); hr(); };

// =============================================================================
// MODULE 1: SYMBOLIC CALCULUS
// =============================================================================

h2('MODULE 1 — Symbolic Calculus Engine');

// --- 1a. Define and differentiate sin(x²) ---
{
    const x = symVar('x');
    const f = sin(symPow(x, symConst(2)));

    console.log('\n1a. Differentiating sin(x²) with chain rule:');
    console.log('   f(x) =', symToLatex(f));

    const df = symSimplify(symDiff(f, 'x'));
    console.log("   f'(x) =", symToLatex(df));

    const d2f = symSimplify(symNthDiff(f, 'x', 2));
    console.log("   f''(x) =", symToLatex(d2f));

    // Verify numerically at x=1
    const val = symEval(df, { x: 1 });
    const expected = 2 * Math.cos(1);
    console.log(`   Numerical check: f'(1) = ${val.toFixed(6)} (expected ${expected.toFixed(6)})`);
}

// --- 1b. Integrate ln(x) ---
{
    const x = symVar('x');
    const f = ln(x);

    console.log('\n1b. Integrating ln(x):');
    // ∫ ln(x) dx = x ln(x) - x  (by parts)
    // Use numerical for verification since symbolic returns null for ln(x)
    const result = symNumericalIntegrate(f, 'x', 1, Math.E);
    console.log(`   ∫₁ᵉ ln(x) dx ≈ ${result.toFixed(6)} (exact: 1.000000)`);
}

// --- 1c. Taylor series for cos(x) around 0 ---
{
    const x = symVar('x');
    const f = cos(x);

    console.log('\n1c. Taylor series for cos(x) at x=0 (6 terms):');
    const series = symTaylorSeries(f, 'x', 0, 6);
    console.log('   T(x) ≈', series.latex);
    console.log('   At x=π/4: T(π/4) ≈', series.evaluate(Math.PI / 4).toFixed(6),
                '  cos(π/4) =', Math.cos(Math.PI / 4).toFixed(6));
}

// --- 1d. Chain rule for (sin(x)/x)' ---
{
    const x = symVar('x');
    const f = symDiv(sin(x), x);
    const df = symSimplify(symDiff(f, 'x'));
    console.log('\n1d. d/dx [sin(x)/x]:');
    console.log('   =', symToLatex(df));
    console.log('   At x=1:', symEval(df, { x: 1 }).toFixed(6),
                ' (expected', (Math.cos(1) / 1 - Math.sin(1) / 1).toFixed(6), ')');
}

// =============================================================================
// MODULE 2: ODE SOLVERS
// =============================================================================

h2('MODULE 2 — Ordinary Differential Equations');

// --- 2a. Simple decay: dy/dt = -0.5y, y(0) = 10 ---
{
    const f = (t, y) => -0.5 * y;
    const sol = rk4(f, 0, 10, 5, 0.01);
    const exact = t => 10 * Math.exp(-0.5 * t);

    console.log('\n2a. Exponential decay  dy/dt = -0.5y,  y(0)=10:');
    console.log('   Method: RK4');
    [0, 1, 2, 5].forEach(t => {
        const numerical = interpolateSolution(sol, t);
        const analytical = exact(t);
        const err = Math.abs(numerical - analytical);
        console.log(`   t=${t}: y=${numerical.toFixed(6)}  exact=${analytical.toFixed(6)}  err=${err.toExponential(2)}`);
    });
}

// --- 2b. Logistic growth ---
{
    const sol = solveLogistic(0.3, 100, 0, 5, 10, 0.05);
    const stats = analyzeSolution(sol);
    console.log('\n2b. Logistic growth  dy/dt = 0.3y(1-y/100),  y(0)=5:');
    console.log(`   Final value: ${stats.finalValue.toFixed(2)} (carrying capacity: 100)`);
    console.log(`   Stable: ${stats.stable}`);
}

// --- 2c. Damped harmonic oscillator ---
{
    const sol = solveDampedHarmonic(0.1, 2 * Math.PI, null, 0, 1, 0, 10, 0.005);
    const stats = analyzeSolution(sol);
    console.log('\n2c. Damped harmonic oscillator  y\'\'+0.2y\'+4π²y=0,  y(0)=1, y\'(0)=0:');
    console.log(`   Damping type: ${sol.dampingType}`);
    console.log(`   Max: ${stats.max.toFixed(4)},  Final: ${stats.finalValue.toFixed(4)}`);
    if (stats.period) console.log(`   Estimated period: ${stats.period.toFixed(4)}`);
}

// --- 2d. Lotka-Volterra predator-prey system ---
{
    const alpha = 1.0, beta = 0.1, delta = 0.075, gamma = 1.5;
    const F = (t, [x, y]) => [
        alpha * x - beta * x * y,
        -gamma * y + delta * x * y
    ];
    const sol = rk4System(F, 0, [10, 5], 30, 0.01);
    const finalPrey     = sol.Y.at(-1)[0].toFixed(2);
    const finalPredator = sol.Y.at(-1)[1].toFixed(2);
    console.log('\n2d. Lotka-Volterra predator-prey:');
    console.log(`   Initial: prey=10, predator=5`);
    console.log(`   At t=30: prey=${finalPrey}, predator=${finalPredator}`);
}

// --- 2e. Lorenz attractor (brief) ---
{
    const sol = solveLorenz([0.1, 0, 0], 0, 5, 0.005);
    const final = sol.Y.at(-1);
    console.log('\n2e. Lorenz attractor (σ=10, ρ=28, β=8/3):');
    console.log(`   At t=5: x=${final[0].toFixed(3)}, y=${final[1].toFixed(3)}, z=${final[2].toFixed(3)}`);
}

// =============================================================================
// MODULE 3: LINEAR ALGEBRA
// =============================================================================

h2('MODULE 3 — Linear Algebra');

// --- 3a. Solve Ax = b ---
{
    const A = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]];
    const b = [8, -11, -3];
    const x = solve(A, b);
    console.log('\n3a. Solve 3×3 system Ax = b:');
    console.log('   x =', vecToString(x));
    // Verify: Ax should equal b
    const Ax = A.map(row => dot(row, x));
    console.log('   Ax =', vecToString(Ax), ' (should equal [8, -11, -3])');
}

// --- 3b. Eigenvalues of symmetric matrix ---
{
    const A = [[4, 1, 0], [1, 3, 1], [0, 1, 2]];
    const { eigenvalues: evals } = eigenvalues(A);
    console.log('\n3b. Eigenvalues of symmetric matrix:');
    console.log('   A =\n', A.map(r => '     ' + r.join('  ')).join('\n'));
    console.log('   λ =', vecToString(evals));
    console.log('   det(A) =', det(A).toFixed(4));
    console.log('   trace(A) = ', trace(A), '≈ sum of eigenvalues:', evals.reduce((a, b) => a + b, 0).toFixed(4));
}

// --- 3c. QR Decomposition ---
{
    const A = [[1, 2, 3], [4, 5, 6], [7, 8, 10]];
    const { Q, R } = qrDecomp(A);
    const QR = matMul(Q, R);
    console.log('\n3c. QR Decomposition A = QR:');
    console.log('   A =\n', A.map(r => '     ' + r.map(v => v.toFixed(0)).join('  ')).join('\n'));
    console.log('   Verification QR ≈ A:');
    console.log(matToString(QR, 2));
}

// --- 3d. Numerical Hessian for optimization ---
{
    const f = ([x, y]) => (x - 3) ** 2 + 2 * (y + 1) ** 2 + x * y;
    const H = hessian(f, [3, -1]);
    console.log('\n3d. Hessian of f(x,y)=(x-3)²+2(y+1)²+xy at (3,-1):');
    console.log(matToString(H, 4));
    // Minimum via gradient descent
    const result = gradientDescent(f, [0, 0], { lr: 0.05, maxIter: 5000, tol: 1e-10 });
    console.log('   Minimum found at x=', vecToString(result.x), ' f=', result.fValue.toFixed(8));
}

// =============================================================================
// MODULE 4: STATISTICS & PROBABILITY
// =============================================================================

h2('MODULE 4 — Statistics & Probability');

// --- 4a. Descriptive statistics ---
{
    const data = [2, 4, 4, 4, 5, 5, 7, 9];
    const stats = describe(data);
    console.log('\n4a. Descriptive statistics for [2,4,4,4,5,5,7,9]:');
    console.log(`   Mean: ${stats.mean.toFixed(4)}, Std: ${stats.std.toFixed(4)}`);
    console.log(`   Median: ${stats.median}, IQR: ${stats.iqr}`);
    console.log(`   Skewness: ${stats.skewness.toFixed(4)}, Kurtosis: ${stats.kurtosis.toFixed(4)}`);
}

// --- 4b. Normal distribution ---
{
    console.log('\n4b. Normal distribution N(0,1):');
    [0, 1, 2].forEach(z => {
        const p = normalCDF(z);
        console.log(`   P(Z ≤ ${z}) = ${p.toFixed(4)}`);
    });
    console.log(`   Inverse: Q(0.975) = ${normalInvCDF(0.975).toFixed(4)} (expected 1.96)`);
}

// --- 4c. One-sample t-test ---
{
    const sample = [4.1, 3.8, 4.2, 4.0, 3.9, 4.3, 4.1, 3.7];
    const result = tTest(sample, 4.0);
    console.log('\n4c. One-sample t-test (H₀: μ = 4.0):');
    console.log(`   t=${result.t.toFixed(4)}, df=${result.df}, p=${result.pValue.toFixed(4)}`);
    console.log(`   95% CI: [${result.ci95[0].toFixed(3)}, ${result.ci95[1].toFixed(3)}]`);
    console.log(`   Reject H₀: ${result.reject}`);
}

// --- 4d. Custom PDF integration (expected value via SLaNg connection) ---
{
    // f(x) = 2x on [0,1]  —  E[X] = ∫₀¹ x·2x dx = 2/3
    const pdf = x => 2 * x;
    const EX = expectedValue(pdf, x => x, 0, 1);
    const VX = variance(pdf, 0, 1);
    console.log('\n4d. Custom PDF f(x) = 2x on [0,1]:');
    console.log(`   E[X] = ${EX.toFixed(6)} (exact: ${(2/3).toFixed(6)})`);
    console.log(`   Var[X] = ${VX.toFixed(6)} (exact: ${(1/18).toFixed(6)})`);
}

// --- 4e. Polynomial regression ---
{
    const x = [0, 1, 2, 3, 4, 5];
    const y = [1, 1.8, 4.1, 8.9, 16.2, 25.3];
    const reg = polyRegression(x, y, 2);
    console.log('\n4e. Polynomial regression (degree 2) for noisy y ≈ x²:');
    console.log(`   Coefficients: [${reg.coefficients.map(c => c.toFixed(3)).join(', ')}]`);
    console.log(`   R² = ${reg.r2.toFixed(4)}`);
    console.log(`   Prediction at x=6: ${reg.predict(6).toFixed(3)}`);
}

// --- 4f. Monte Carlo integration ---
{
    const result = monteCarloIntegrate(
        ([x, y]) => x * x + y * y <= 1 ? 1 : 0,
        [[- 1, 1], [-1, 1]],
        200_000
    );
    console.log('\n4f. Monte Carlo estimate of π (circle area method):');
    console.log(`   Estimate: ${result.estimate.toFixed(4)} (π ≈ ${Math.PI.toFixed(4)})`);
    console.log(`   Std error: ${result.stdError.toFixed(4)}`);
}

// =============================================================================
// MODULE 5: COMPLEX NUMBERS
// =============================================================================

h2('MODULE 5 — Complex Numbers & Complex Calculus');

// --- 5a. Basic arithmetic ---
{
    const z1 = C(3, 4);
    const z2 = C(1, -2);
    console.log('\n5a. Complex arithmetic:');
    console.log(`   z1 = ${cToString(z1)},  z2 = ${cToString(z2)}`);
    console.log(`   z1 + z2 = ${cToString(cAdd(z1, z2))}`);
    console.log(`   z1 * z2 = ${cToString(cMul(z1, z2))}`);
    console.log(`   z1 / z2 = ${cToString(cDiv(z1, z2))}`);
    console.log(`   |z1| = ${cAbs(z1).toFixed(4)}`);
    console.log(`   arg(z1) = ${(cArg(z1) * 180 / Math.PI).toFixed(2)}°`);
}

// --- 5b. Complex exponential and Euler's formula ---
{
    const z = C(0, Math.PI);
    const eiz = cExp(z);
    console.log('\n5b. Euler\'s formula: e^(iπ) + 1 = 0:');
    console.log(`   e^(iπ) = ${cToString(eiz, 6)}`);
    console.log(`   e^(iπ) + 1 = ${cToString(cAdd(eiz, C(1)), 6)}`);
}

// --- 5c. Roots of unity ---
{
    const z = C(1, 0);
    const roots = [];
    for (let k = 0; k < 5; k++) {
        roots.push(fromPolar(1, 2 * Math.PI * k / 5));
    }
    console.log('\n5c. 5th roots of unity:');
    roots.forEach((r, k) => console.log(`   z${k} = ${cToString(r)}`));
}

// --- 5d. Polynomial root finding ---
{
    // z³ - 1 = 0  has roots: 1, e^{2πi/3}, e^{4πi/3}
    const coeffs = [-1, 0, 0, 1]; // -1 + 0z + 0z² + z³
    const roots = polyRoots(coeffs);
    console.log('\n5d. Roots of z³ - 1 = 0:');
    roots.forEach(r => console.log(`   ${cToString(r)}`));
}

// --- 5e. Residue of 1/(z²+1) at z=i ---
{
    const f = z => cDiv(C(1), cAdd(cMul(z, z), C(1)));
    const res = residue(f, C(0, 1), 0.01);
    console.log('\n5e. Residue of 1/(z²+1) at z=i:');
    console.log(`   Res = ${cToString(res)}  (exact: 0 - 0.5i)`);
}

// --- 5f. FFT ---
{
    // Signal: sum of two sinusoids at frequencies 3 Hz and 7 Hz
    const N = 64, fs = 64;
    const signal = Array.from({ length: N }, (_, n) =>
        Math.cos(2 * Math.PI * 3 * n / fs) + 0.5 * Math.cos(2 * Math.PI * 7 * n / fs));
    const { frequencies, magnitudes } = realFFT(signal);

    console.log('\n5f. FFT of signal with frequencies at 3 Hz and 7 Hz:');
    // Show top 5 frequency components
    const indexed = magnitudes.slice(0, 20).map((m, i) => ({ f: frequencies[i], m }));
    indexed.sort((a, b) => b.m - a.m);
    indexed.slice(0, 5).forEach(({ f, m }) =>
        console.log(`   f=${f} Hz: magnitude=${m.toFixed(4)}`));
}

// =============================================================================
// SUMMARY
// =============================================================================

h2('SLaNg v2 — Upgrade Summary');

console.log(`
  New modules added:

  ┌─────────────────────┬─────────────────────────────────────────────────┐
  │ slang-symbolic.js   │ Chain/product/quotient rule for trig, exp, log  │
  │                     │ Symbolic integration, Taylor series, LaTeX render│
  ├─────────────────────┼─────────────────────────────────────────────────┤
  │ slang-ode.js        │ Euler, Heun, RK4, adaptive RK45                 │
  │                     │ 2nd-order, systems, Lorenz, Lotka-Volterra, BVPs│
  ├─────────────────────┼─────────────────────────────────────────────────┤
  │ slang-linalg.js     │ LU/QR decomp, eigenvalues, solve Ax=b, inv      │
  │                     │ Jacobian, Hessian, Newton-Raphson, grad descent  │
  ├─────────────────────┼─────────────────────────────────────────────────┤
  │ slang-stats.js      │ 15+ distributions, t/z/chi-sq tests              │
  │                     │ Linear + polynomial regression, Monte Carlo       │
  ├─────────────────────┼─────────────────────────────────────────────────┤
  │ slang-complex.js    │ Complex arithmetic, roots, trig in ℂ             │
  │                     │ Polynomial roots, contour integrals, FFT/IFFT    │
  └─────────────────────┴─────────────────────────────────────────────────┘
`);
