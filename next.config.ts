/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import type { NextConfig } from "next";
import "./src/env";

const config: NextConfig = {
	// if this enabled motion animations don't work
	// reactCompiler: true, 
};

export default config;
