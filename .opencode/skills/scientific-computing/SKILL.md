---
name: scientific-computing
description: Structure scientific programs and numerical experiments on the workbench — reproducible Python (numpy/scipy/pandas/matplotlib/sympy), deterministic environments, vectorised numerics, and validation. Use for simulations, numerical methods, modelling, or any scientific program.
license: MIT
compatibility: opencode
metadata:
  domain: science
  audience: researchers
---

# Scientific Computing

## Environment

- Install the `scientific` component: `install_component { component: "scientific", confirm: true }` (numpy, scipy, pandas, matplotlib, sympy; optional Jupyter/R/Julia).
- Pin dependencies with `uv` where possible; keep a lockfile.
- One experiment per module; a `run.py`/`Makefile` entry point; no hidden state.

## Conventions

- **Determinism**: seed all RNGs (`numpy.random.default_rng(seed)`), record seed + versions in the output.
- **Vectorise**: prefer array ops over Python loops; note big-O and memory.
- **Units & types**: keep arrays `float64` unless justified; use `pint`-style unit comments.
- **Validation**: compare against a known analytic case or a reference implementation; assert tolerances, not equality.
- **Reproducibility**: emit a `results/` artifact with inputs, code version, and checksums.

## Structure

```
src/<experiment>.py      # model / solver
tests/                   # analytic or reference checks
results/                 # generated outputs (gitignored)
```

## Verify

- Unit-check each numerical kernel against an analytic solution.
- Plot or tabulate convergence (error vs step size).
- Run in the compute box (`cs run`), never locally, when heavy.
