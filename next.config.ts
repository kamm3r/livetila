/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import type { NextConfig } from "next";
import "./src/env";

const config: NextConfig = {
	// reactCompiler: true,
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default config;
